<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class FailedPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'email',
        'razorpay_order_id',
        'razorpay_payment_id',
        'amount',
        'currency',
        'failure_reason',
        'failure_code',
        'recovery_status',
        'recovery_attempts',
        'last_recovery_email_at',
        'recovered_at',
        'recovery_token',
        'recovery_token_expires_at',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'recovery_attempts' => 'integer',
        'last_recovery_email_at' => 'datetime',
        'recovered_at' => 'datetime',
        'recovery_token_expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Scopes
    public function scopePendingRecovery($query)
    {
        return $query->whereIn('recovery_status', ['pending', 'email_sent'])
            ->where('recovery_attempts', '<', 4);
    }

    public function scopeRecoverable($query)
    {
        return $query->pendingRecovery()
            ->where('created_at', '>=', now()->subDays(3));
    }

    // Relationships
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helpers
    public function generateRecoveryToken(): string
    {
        $this->recovery_token = Str::random(64);
        $this->recovery_token_expires_at = now()->addHours(24);
        $this->save();
        
        return $this->recovery_token;
    }

    public function isRecoveryTokenValid(string $token): bool
    {
        return $this->recovery_token === $token
            && $this->recovery_token_expires_at
            && $this->recovery_token_expires_at->isFuture();
    }

    public function markAsRecovered(): void
    {
        $this->update([
            'recovery_status' => 'recovered',
            'recovered_at' => now(),
        ]);
    }

    public function incrementRecoveryAttempt(): void
    {
        $this->increment('recovery_attempts');
        $this->update(['last_recovery_email_at' => now()]);
    }
}
