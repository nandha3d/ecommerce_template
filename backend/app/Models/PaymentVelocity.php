<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\ConfigurationService;

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

    // Scopes
    public function scopeWithinWindow($query, ?int $hours = null)
    {
        if ($hours === null) {
            $config = app(ConfigurationService::class);
            $hours = $config->getInt('payment.velocity.window_hours', 24);
        }
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
        
        $config = app(ConfigurationService::class);
        $windowHours = $config->getInt('payment.velocity.window_hours', 24);

        // Reset if window expired
        if ($record->exists && $record->window_start && $record->window_start->diffInHours(now()) >= $windowHours) {
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
        $config = app(ConfigurationService::class);
        $limit = $config->getInt("payment.velocity.limit.{$type}", self::getDefaultLimit($type));
        
        $record = static::ofType($type)
            ->where('value', $value)
            ->withinWindow() // uses default config from scope
            ->first();
        
        return $record && $record->attempt_count >= $limit;
    }

    public static function getVelocityScore(string $type, string $value): int
    {
        $config = app(ConfigurationService::class);
        $limit = $config->getInt("payment.velocity.limit.{$type}", self::getDefaultLimit($type));
        
        $record = static::ofType($type)
            ->where('value', $value)
            ->withinWindow()
            ->first();
        
        if (!$record) {
            return 0;
        }
        
        // Score based on how close to limit (0-25 points)
        $ratio = $limit > 0 ? $record->attempt_count / $limit : 1;
        return (int) min(25, $ratio * 25);
    }

    private static function getDefaultLimit(string $type): int
    {
        return match($type) {
            'ip' => 10,
            'email' => 5,
            'card' => 3,
            'user' => 10,
            default => 10
        };
    }
}
