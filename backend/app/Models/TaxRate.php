<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class TaxRate extends Model
{
    protected $fillable = [
        'country',
        'state',
        'tax_type',
        'rate',
        'effective_from',
        'effective_until',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'effective_from' => 'date',
        'effective_until' => 'date',
        'is_active' => 'boolean',
        'metadata' => 'array',
        'rate' => 'decimal:2',
    ];

    /**
     * Get current active tax rate for a location
     */
    public static function getCurrentRate(string $country, ?string $state = null): ?self
    {
        return self::where('country', $country)
            ->when($state, fn($q) => $q->where('state', $state))
            ->where('is_active', true)
            ->where('effective_from', '<=', Carbon::today())
            ->where(function ($q) {
                $q->whereNull('effective_until')
                  ->orWhere('effective_until', '>=', Carbon::today());
            })
            ->first();
    }

    /**
     * Get tax rate that was active on a specific date (for audit)
     */
    public static function getRateOnDate(string $country, Carbon $date, ?string $state = null): ?self
    {
        return self::where('country', $country)
            ->when($state, fn($q) => $q->where('state', $state))
            ->where('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_until')
                  ->orWhere('effective_until', '>=', $date);
            })
            ->first();
    }
}
