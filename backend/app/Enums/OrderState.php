<?php

namespace App\Enums;

enum OrderState: string
{
    case PENDING = 'pending';
    case PAYMENT_PENDING = 'payment_pending';
    case PAID = 'paid';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';
    case FULFILLED = 'fulfilled';
    case FRAUD_DETECTED = 'fraud_detected';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::PAYMENT_PENDING => 'Payment Pending',
            self::PAID => 'Paid',
            self::FAILED => 'Failed',
            self::CANCELLED => 'Cancelled',
            self::FULFILLED => 'Fulfilled',
            self::FRAUD_DETECTED => 'Fraud Detected',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'gray',
            self::PAYMENT_PENDING => 'yellow',
            self::PAID => 'green',
            self::FAILED => 'red',
            self::CANCELLED => 'red',
            self::FULFILLED => 'blue',
            self::FRAUD_DETECTED => 'red',
        };
    }
}
