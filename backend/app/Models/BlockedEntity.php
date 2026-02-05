<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockedEntity extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'value',
        'reason',
        'blocked_by',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Relationships
    public function blockedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocked_by');
    }

    // Static helpers
    public static function isBlocked(string $type, string $value): bool
    {
        return static::active()
            ->ofType($type)
            ->where('value', $value)
            ->exists();
    }

    public static function blockEntity(string $type, string $value, ?string $reason = null, ?int $blockedBy = null, ?\DateTime $expiresAt = null): self
    {
        return static::updateOrCreate(
            ['type' => $type, 'value' => $value],
            [
                'reason' => $reason,
                'blocked_by' => $blockedBy,
                'expires_at' => $expiresAt,
                'is_active' => true,
            ]
        );
    }
}
