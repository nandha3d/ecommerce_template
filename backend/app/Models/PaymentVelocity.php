<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentVelocity extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'value',
        'attempt_count',
        'success_count',
        'failure_count',
        'total_amount',
        'window_start',
    ];

    protected $casts = [
        'attempt_count' => 'integer',
        'success_count' => 'integer',
        'failure_count' => 'integer',
        'total_amount' => 'decimal:2',
        'window_start' => 'datetime',
    ];

    // Velocity limits per 24 hours
    public const LIMITS = [
        'ip' => 10,      // 10 attempts per IP
        'email' => 5,    // 5 attempts per email
        'card' => 3,     // 3 attempts per card
        'user' => 10,    // 10 attempts per user
    ];

    // Scopes
    public function scopeWithinWindow($query, int $hours = 24)
    {
        return $query->where('window_start', '>=', now()->subHours($hours));
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Static helpers
    public static function recordAttempt(string $type, string $value, float $amount = 0): self
    {
        $record = static::firstOrNew(['type' => $type, 'value' => $value]);
        
        // Reset if window expired (24 hours)
        if ($record->exists && $record->window_start && $record->window_start->diffInHours(now()) >= 24) {
            $record->attempt_count = 0;
            $record->success_count = 0;
            $record->failure_count = 0;
            $record->total_amount = 0;
            $record->window_start = now();
        }
        
        if (!$record->exists) {
            $record->window_start = now();
        }
        
        $record->attempt_count++;
        $record->total_amount += $amount;
        $record->save();
        
        return $record;
    }

    public static function recordSuccess(string $type, string $value): void
    {
        static::where('type', $type)
            ->where('value', $value)
            ->increment('success_count');
    }

    public static function recordFailure(string $type, string $value): void
    {
        static::where('type', $type)
            ->where('value', $value)
            ->increment('failure_count');
    }

    public static function isVelocityExceeded(string $type, string $value): bool
    {
        $limit = self::LIMITS[$type] ?? 10;
        
        $record = static::ofType($type)
            ->where('value', $value)
            ->withinWindow(24)
            ->first();
        
        return $record && $record->attempt_count >= $limit;
    }

    public static function getVelocityScore(string $type, string $value): int
    {
        $limit = self::LIMITS[$type] ?? 10;
        
        $record = static::ofType($type)
            ->where('value', $value)
            ->withinWindow(24)
            ->first();
        
        if (!$record) {
            return 0;
        }
        
        // Score based on how close to limit (0-25 points)
        $ratio = $record->attempt_count / $limit;
        return (int) min(25, $ratio * 25);
    }
}
