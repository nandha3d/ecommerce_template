<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'gateway_id',
        'transaction_id',
        'gateway_transaction_id',
        'amount',
        'currency',
        'status',
        'gateway_response',
        'failure_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (!$transaction->transaction_id) {
                $transaction->transaction_id = 'TXN_' . strtoupper(Str::random(16));
            }
        });
    }

    /**
     * Get the order
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the payment gateway
     */
    public function gateway()
    {
        return $this->belongsTo(PaymentGateway::class, 'gateway_id');
    }

    /**
     * Mark as completed
     */
    public function markCompleted(string $gatewayTransactionId, array $response = [])
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'gateway_transaction_id' => $gatewayTransactionId,
            'gateway_response' => $response,
        ]);
    }

    /**
     * Mark as failed
     */
    public function markFailed(string $reason, array $response = [])
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'failure_reason' => $reason,
            'gateway_response' => $response,
        ]);
    }

    /**
     * Check if successful
     */
    public function getIsSuccessfulAttribute()
    {
        return $this->status === self::STATUS_COMPLETED;
    }
}
