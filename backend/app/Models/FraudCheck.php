<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FraudCheck extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'email',
        'ip_address',
        'device_fingerprint',
        'score',
        'result',
        'risk_factors',
        'metadata',
    ];

    protected $casts = [
        'score' => 'integer',
        'risk_factors' => 'array',
        'metadata' => 'array',
    ];

    // Scopes
    public function scopeBlocked($query)
    {
        return $query->where('result', 'block');
    }

    public function scopeHighRisk($query, int $threshold = 70)
    {
        return $query->where('score', '>=', $threshold);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
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
    public function isHighRisk(): bool
    {
        return $this->score >= 70;
    }

    public function isMediumRisk(): bool
    {
        return $this->score >= 30 && $this->score < 70;
    }

    public function isLowRisk(): bool
    {
        return $this->score < 30;
    }
}
