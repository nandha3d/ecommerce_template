<?php

namespace App\Enums;

/**
 * Cart State Machine
 * 
 * Defines valid cart states and allowed transitions.
 * 
 * Transitions:
 *   active -> locked (checkout started)
 *   locked -> checked_out (order created)
 *   locked -> active (checkout abandoned/failed)
 *   active -> expired (cart timeout)
 */
enum CartState: string
{
    case ACTIVE = 'active';
    case LOCKED = 'locked';
    case CHECKED_OUT = 'checked_out';
    case EXPIRED = 'expired';

    /**
     * Get valid state transitions map.
     */
    private static function transitions(): array
    {
        return [
            'active' => ['locked', 'expired'],
            'locked' => ['checked_out', 'active'], // active = rollback on failed checkout
            'checked_out' => [], // Terminal state
            'expired' => [], // Terminal state
        ];
    }

    /**
     * Check if transition from current state to target state is allowed.
     */
    public static function canTransition(string $from, string $to): bool
    {
        $transitions = self::transitions();
        return in_array($to, $transitions[$from] ?? [], true);
    }

    /**
     * Validate and return the target state or throw exception.
     */
    public static function transition(string $from, string $to): string
    {
        if (!self::canTransition($from, $to)) {
            throw new \InvalidArgumentException(
                "Invalid cart state transition: {$from} -> {$to}"
            );
        }
        return $to;
    }

    /**
     * Check if cart can be modified (items added/removed).
     */
    public static function canModify(string $state): bool
    {
        return $state === self::ACTIVE->value;
    }

    /**
     * Check if cart can start checkout.
     */
    public static function canCheckout(string $state): bool
    {
        return in_array($state, [self::ACTIVE->value, self::LOCKED->value], true);
    }
}
