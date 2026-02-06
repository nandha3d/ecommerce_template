<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'idempotency_key',
        'user_id',
        'status',
        'payment_status',
        'payment_method',
        'billing_address_id',
        'shipping_address_id',
        'subtotal',
        'discount',
        'shipping',
        'tax',
        'total',
        'coupon_id',
        'notes',
        'tracking_number',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'status' => \App\Enums\OrderState::class,
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'shipping' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_FAILED = 'failed';
    const PAYMENT_REFUNDED = 'refunded';

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the billing address.
     */
    public function billingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    /**
     * Get the shipping address.
     */
    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    /**
     * Get the coupon applied.
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });

        // 🔒 IMMUTABILITY GUARD
        static::updating(function ($order) {
            $immutableFields = [
                'total', 'subtotal', 'tax', 'discount', 'shipping', 
                'currency', 'order_number', 'user_id'
            ];

            foreach ($immutableFields as $field) {
                if ($order->isDirty($field)) {
                    // Allow if it's the first time setting it (should be creating, but just in case)
                    // Actually, updates shouldn't touch these.
                    \Log::critical("SECURITY: Attempt to mutate immutable order field", [
                        'order_id' => $order->id,
                        'field' => $field,
                        'old' => $order->getOriginal($field),
                        'new' => $order->$field,
                        'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 5)
                    ]);
                    throw new \RuntimeException("Security Violation: Order field '{$field}' is immutable.");
                }
            }
            
            // State transitions must go through StateMachine (Blocked here? No, model doesn't know source)
            // But we can implicitly trust if the updated_at changes. 
            // We can't easily block specific callers here without complex trace analysis.
            // The "OrderStateMachine" requirement comes later.
        });
        
        static::deleting(function ($order) {
            // Optional: Block deletion of paid orders?
            if ($order->status !== \App\Enums\OrderState::PENDING && $order->status !== \App\Enums\OrderState::FAILED) {
                 throw new \RuntimeException("Security Violation: Cannot delete processed order.");
            }
        });
    }

    /**
     * Generate unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -4));
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Scope for pending orders.
     */
    public function scopePending($query)
    {
        return $query->where('status', \App\Enums\OrderState::PENDING);
    }

    /**
     * Scope for paid orders.
     */
    public function scopePaid($query)
    {
        return $query->where('status', \App\Enums\OrderState::PAID);
    }

    /**
     * Scope for fulfilled orders.
     */
    public function scopeFulfilled($query)
    {
        return $query->where('status', \App\Enums\OrderState::FULFILLED);
    }



}
