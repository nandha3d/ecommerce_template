<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Security Audit Log
 * 
 * Records security-sensitive actions for audit trail.
 * 
 * Actions tracked:
 * - cart_mutation: Cart add/update/remove
 * - checkout_start: Checkout session initiated
 * - order_create: Order placed
 * - order_cancel: Order cancelled
 * - payment_attempt: Payment initiated
 * - payment_success: Payment completed
 * - payment_failed: Payment failed
 * - auth_login: User login
 * - auth_logout: User logout
 * - auth_failed: Failed login attempt
 */
class SecurityAuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'ip_address',
        'user_agent',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * User who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related entity (polymorphic helper).
     */
    public function getEntityAttribute(): ?Model
    {
        if (!$this->entity_type || !$this->entity_id) {
            return null;
        }

        $modelClass = 'App\\Models\\' . $this->entity_type;
        if (class_exists($modelClass)) {
            return $modelClass::find($this->entity_id);
        }

        return null;
    }
}
