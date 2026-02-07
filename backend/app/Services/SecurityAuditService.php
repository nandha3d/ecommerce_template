<?php

namespace App\Services;

use App\Models\SecurityAuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Security Audit Service
 * 
 * Provides centralized logging for security-sensitive actions.
 * All commerce-critical actions should be logged for audit trail.
 */
class SecurityAuditService
{
    private ?Request $request;

    public function __construct(?Request $request = null)
    {
        $this->request = $request ?? request();
    }

    /**
     * Log a security-sensitive action.
     *
     * @param string $action Action identifier (e.g., 'cart_mutation', 'order_create')
     * @param Model|null $entity Related entity (Cart, Order, etc.)
     * @param array $metadata Additional context data
     */
    public function log(string $action, ?Model $entity = null, array $metadata = []): void
    {
        try {
            SecurityAuditLog::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'entity_type' => $entity ? class_basename($entity) : null,
                'entity_id' => $entity?->id,
                'ip_address' => $this->request?->ip() ?? '0.0.0.0',
                'user_agent' => $this->request?->userAgent(),
                'metadata' => array_merge($metadata, [
                    'session_id' => $this->request?->header('X-Cart-Session'),
                    'route' => $this->request?->path(),
                ]),
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Never let audit logging break the main flow
            Log::error('Audit logging failed: ' . $e->getMessage(), [
                'action' => $action,
                'entity' => $entity ? class_basename($entity) . ':' . $entity->id : null,
            ]);
        }
    }

    /**
     * Log cart mutation (add/update/remove item).
     */
    public function logCartMutation(Model $cart, string $mutationType, array $itemData = []): void
    {
        $this->log('cart_mutation', $cart, [
            'mutation_type' => $mutationType, // add, update, remove, clear
            'item_data' => $itemData,
        ]);
    }

    /**
     * Log checkout session start.
     */
    public function logCheckoutStart(Model $cart, Model $session): void
    {
        $this->log('checkout_start', $cart, [
            'session_id' => $session->id,
            'cart_total' => $cart->total,
        ]);
    }

    /**
     * Log order creation.
     */
    public function logOrderCreate(Model $order): void
    {
        $this->log('order_create', $order, [
            'order_number' => $order->order_number,
            'total' => $order->total,
            'payment_method' => $order->payment_method,
        ]);
    }

    /**
     * Log order cancellation.
     */
    public function logOrderCancel(Model $order): void
    {
        $this->log('order_cancel', $order, [
            'order_number' => $order->order_number,
            'previous_status' => $order->getOriginal('status'),
        ]);
    }

    /**
     * Log payment attempt.
     */
    public function logPaymentAttempt(Model $order, string $gateway, bool $success, ?string $transactionId = null): void
    {
        $action = $success ? 'payment_success' : 'payment_failed';
        
        $this->log($action, $order, [
            'order_number' => $order->order_number,
            'gateway' => $gateway,
            'transaction_id' => $transactionId,
            'amount' => $order->total,
        ]);
    }

    /**
     * Log authentication event.
     */
    public function logAuthEvent(string $type, ?Model $user = null, array $extra = []): void
    {
        $this->log('auth_' . $type, $user, $extra);
    }

    /**
     * Get recent audit logs for a user.
     */
    public function getUserLogs(int $userId, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return SecurityAuditLog::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent audit logs for an IP address.
     */
    public function getIpLogs(string $ip, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return SecurityAuditLog::where('ip_address', $ip)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}
