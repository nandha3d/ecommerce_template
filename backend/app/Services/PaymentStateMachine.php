<?php

namespace App\Services;

use App\Models\PaymentIntent;
use App\Enums\PaymentIntentState;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentStateMachine
{
    private const ALLOWED_TRANSITIONS = [
        PaymentIntentState::CREATED->value => [
            PaymentIntentState::PROCESSING->value,
            PaymentIntentState::FAILED->value,
            PaymentIntentState::CANCELLED->value,
        ],
        PaymentIntentState::PROCESSING->value => [
            PaymentIntentState::SUCCEEDED->value,
            PaymentIntentState::FAILED->value,
        ],
        // Terminal states
        PaymentIntentState::SUCCEEDED->value => [],
        PaymentIntentState::FAILED->value => [
            PaymentIntentState::CREATED->value, // Allow retry? Or just new intent.
        ],
        PaymentIntentState::CANCELLED->value => [],
    ];

    /**
     * Transition a payment intent to a new state.
     */
    public function transition(PaymentIntent $intent, PaymentIntentState $targetState, array $context = []): PaymentIntent
    {
        return DB::transaction(function () use ($intent, $targetState, $context) {
            if (!$this->canTransition($intent->status, $targetState)) {
                $this->logViolation($intent, $targetState, $context);
                throw new \DomainException(
                    "Invalid Payment State Transition: Cannot move PaymentIntent #{$intent->id} from '{$intent->status->value}' to '{$targetState->value}'."
                );
            }

            $previousState = $intent->status;
            $intent->status = $targetState;
            $intent->save();

            $this->auditLog($intent, $previousState, $targetState, $context);

            return $intent;
        });
    }

    /**
     * Check if a transition is valid.
     */
    public function canTransition(PaymentIntentState $from, PaymentIntentState $to): bool
    {
        $allowed = self::ALLOWED_TRANSITIONS[$from->value] ?? [];
        return in_array($to->value, $allowed, true);
    }

    private function logViolation(PaymentIntent $intent, PaymentIntentState $target, array $context): void
    {
        Log::warning("SECURITY: Invalid Payment State Transition Attempt", [
            'payment_intent_id' => $intent->id,
            'current_state' => $intent->status->value,
            'attempted_state' => $target->value,
            'context' => $context,
        ]);
    }

    private function auditLog(PaymentIntent $intent, PaymentIntentState $from, PaymentIntentState $to, array $context): void
    {
        Log::info("PAYMENT_TRANSITION: PaymentIntent #{$intent->id} moved {$from->value} -> {$to->value}", [
            'payment_intent_id' => $intent->id,
            'from' => $from->value,
            'to' => $to->value,
            'user_id' => auth()->id(),
            'timestamp' => now()->toIso8601String()
        ]);
    }
}
