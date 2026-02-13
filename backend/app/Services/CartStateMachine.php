<?php

namespace App\Services;

use App\Models\Cart;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CartStateMachine
{
    public const STATE_ACTIVE = 'active';
    public const STATE_CHECKOUT = 'checkout';
    public const STATE_COMPLETED = 'completed';
    public const STATE_EXPIRED = 'expired';

    private const ALLOWED_TRANSITIONS = [
        self::STATE_ACTIVE => [
            self::STATE_CHECKOUT,
            self::STATE_EXPIRED,
        ],
        self::STATE_CHECKOUT => [
            self::STATE_ACTIVE,     // Allow returning to active if checkout is cancelled/fails
            self::STATE_COMPLETED,
            self::STATE_EXPIRED,
        ],
        // Terminal states
        self::STATE_COMPLETED => [],
        self::STATE_EXPIRED => [],
    ];

    /**
     * Transition a cart to a new state.
     */
    public function transition(Cart $cart, string $targetState, array $context = []): Cart
    {
        return DB::transaction(function () use ($cart, $targetState, $context) {
            if (!$this->canTransition($cart->status, $targetState)) {
                $this->logViolation($cart, $targetState, $context);
                throw new \DomainException(
                    "Invalid Cart State Transition: Cannot move Cart #{$cart->id} from '{$cart->status}' to '{$targetState}'."
                );
            }

            $previousState = $cart->status;
            $cart->status = $targetState;
            $cart->save();

            $this->auditLog($cart, $previousState, $targetState, $context);

            return $cart;
        });
    }

    /**
     * Check if a transition is valid.
     */
    public function canTransition(string $from, string $to): bool
    {
        $allowed = self::ALLOWED_TRANSITIONS[$from] ?? [];
        return in_array($to, $allowed, true);
    }

    private function logViolation(Cart $cart, string $target, array $context): void
    {
        Log::warning("SECURITY: Invalid Cart State Transition Attempt", [
            'cart_id' => $cart->id,
            'current_state' => $cart->status,
            'attempted_state' => $target,
            'context' => $context,
        ]);
    }

    private function auditLog(Cart $cart, string $from, string $to, array $context): void
    {
        Log::info("CART_TRANSITION: Cart #{$cart->id} moved {$from} -> {$to}", [
            'cart_id' => $cart->id,
            'from' => $from,
            'to' => $to,
            'user_id' => auth()->id() ?? $cart->user_id,
            'timestamp' => now()->toIso8601String()
        ]);
    }
}
