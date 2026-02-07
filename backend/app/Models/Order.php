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
            
            // State transitions strict check
            if ($order->isDirty('status')) {
                $oldStatus = $order->getOriginal('status');
                $newStatus = $order->status;
                
                // Allow same status (idempotent updates)
                if ($oldStatus === $newStatus) {
                    return;
                }
                
                // Define Valid Transitions
                // From => [To list]
                $validTransitions = [
                    \App\Enums\OrderState::PENDING => [
                        \App\Enums\OrderState::PAID, 
                        \App\Enums\OrderState::CANCELLED,
                        \App\Enums\OrderState::FAILED
                    ],
                    \App\Enums\OrderState::PAID => [
                        \App\Enums\OrderState::PROCESSING, // If applicable
                        \App\Enums\OrderState::SHIPPED,
                        \App\Enums\OrderState::COMPLETED,
                        \App\Enums\OrderState::REFUNDED,
                    ],
                    \App\Enums\OrderState::PROCESSING => [
                        \App\Enums\OrderState::SHIPPED,
                        \App\Enums\OrderState::COMPLETED, // Digital goods?
                        \App\Enums\OrderState::REFUNDED,
                    ],
                    \App\Enums\OrderState::SHIPPED => [
                        \App\Enums\OrderState::COMPLETED,
                        \App\Enums\OrderState::REFUNDED, // Returned
                    ],
                    \App\Enums\OrderState::COMPLETED => [
                         \App\Enums\OrderState::REFUNDED, // Allowed? Maybe.
                    ],
                    \App\Enums\OrderState::CANCELLED => [], // Terminal
                    \App\Enums\OrderState::FAILED => [], // Terminal
                    \App\Enums\OrderState::REFUNDED => [], // Terminal
                ];
                
                // If old status is not in map (e.g. unknown state), allow moving to FAILED/CANCELLED for safety? 
                // Or deny. Strict = Deny.
                
                $allowed = $validTransitions[$oldStatus->value ?? $oldStatus] ?? [];
                
                // Handle Enum objects vs strings if necessary
                $newStatusVal = $newStatus instanceof \UnitEnum ? $newStatus->value : $newStatus;
                $allowedVals = array_map(fn($s) => $s instanceof \UnitEnum ? $s->value : $s, $allowed);
                
                if (!in_array($newStatusVal, $allowedVals)) {
                     \Log::critical("SECURITY: Illegal State Transition", [
                        'order_id' => $order->id,
                        'from' => $oldStatus,
                        'to' => $newStatus,
                        'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3)
                    ]);
                    throw new \RuntimeException("Illegal State Transition: Cannot move from {$oldStatus} to {$newStatus}");
                }
            }
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
