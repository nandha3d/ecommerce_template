<?php

namespace App\Services;

use App\Enums\OrderState;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderStateMachine
{
    /**
     * Strict Phase-1 Transition Table (Step 5.2)
     */
    private const ALLOWED_TRANSITIONS = [
        OrderState::PENDING->value => [
            OrderState::PAYMENT_PENDING->value,
            OrderState::PAID->value,       // Allow direct paid (Sync Payment)
            OrderState::FAILED->value,     // Allow direct fail (Sync Capture Error)
            OrderState::CANCELLED->value,
        ],
        OrderState::PAYMENT_PENDING->value => [
            OrderState::PAID->value,
            OrderState::FAILED->value,
            OrderState::CANCELLED->value,
        ],
        OrderState::PAID->value => [
            OrderState::FULFILLED->value,
        ],
        // Terminal states (no transitions allowed)
        OrderState::FAILED->value => [],
        OrderState::CANCELLED->value => [],
        OrderState::FULFILLED->value => [],
    ];

    /**
     * Attempt to transition an order to a new state.
     *
     * @param Order $order
     * @param OrderState $targetState
     * @param array $context Metadata for the transition (user_id, reason, etc.)
     * @return Order
     * @throws \DomainException
     */
    public function transition(Order $order, OrderState $targetState, array $context = []): Order
    {
        return DB::transaction(function () use ($order, $targetState, $context) {
            // 1. Validate Transition
            if (!$this->canTransition($order->status, $targetState)) {
                $this->logViolation($order, $targetState, $context);
                throw new \DomainException(
                    "Invalid State Transition: Cannot move Order #{$order->id} from '{$order->status->value}' to '{$targetState->value}'."
                );
            }

            // 2. Execute Transition
            $previousState = $order->status;
            $order->status = $targetState;

            // Update timestamps based on state
            if ($targetState === OrderState::PAID) {
                // $order->paid_at = now(); // Ensure column exists if needed, or rely on audit log
            } elseif ($targetState === OrderState::FULFILLED) {
                $order->shipped_at = now();
                $order->delivered_at = now(); // Simplify for Phase-1: Fulfilled = Done
            }

            // 3. Save (Updates guarded by model boot, but status change allowed cleanly?)
            // We blocked 'status' update? 
            // Model boot guards blocked: total, subtotal, tax, discount, shipping, currency, order_number, user_id.
            // Status is NOT in improved guard list => Allowed.
            $order->save();

            // 4. Audit Log
            $this->auditLog($order, $previousState, $targetState, $context);

            return $order;
        });
    }

    /**
     * Check if a transition is valid.
     */
    public function canTransition(OrderState $from, OrderState $to): bool
    {
        $allowed = self::ALLOWED_TRANSITIONS[$from->value] ?? [];
        return in_array($to->value, $allowed, true);
    }

    private function logViolation(Order $order, OrderState $target, array $context): void
    {
        Log::warning("SECURITY: Invalid Order State Transition Attempt", [
            'order_id' => $order->id,
            'current_state' => $order->status->value,
            'attempted_state' => $target->value,
            'context' => $context,
            'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3)
        ]);
    }

    private function auditLog(Order $order, OrderState $from, OrderState $to, array $context): void
    {
        // Using common Log channel for Phase-1, Phase-2 can use DB Audit table
        Log::info("ORDER_TRANSITION: {$order->order_number} moved {$from->value} -> {$to->value}", [
            'order_id' => $order->id,
            'from' => $from->value,
            'to' => $to->value,
            'user_id' => $context['user_id'] ?? auth()->id(),
            'ip' => request()->ip(),
            'timestamp' => now()->toIso8601String()
        ]);
    }
}
