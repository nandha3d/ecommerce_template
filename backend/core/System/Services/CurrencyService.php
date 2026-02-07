<?php

namespace Core\System\Services;

use App\Models\Currency;
use Illuminate\Support\Facades\Cache;

class CurrencyService
{
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get the System Base Currency (Strict).
     * This is the ONLY currency allowed for database storage.
     */
    public function getBaseCurrency(): Currency
    {
        return Cache::remember('currency:base', self::CACHE_TTL, function () {
            // STRICT: Must exist and be unique.
            return Currency::where('is_base', true)->firstOrFail();
        });
    }

    /**
     * Get the active display currency.
     * Logic: User Setting > Cookie > System Default (Base usually).
     * 
     * @param string|null $requestedCode From request/cookie
     */
    public function getDisplayCurrency(?string $requestedCode = null): Currency
    {
        // 1. If explicit code requested and valid, use it.
        if ($requestedCode) {
            $currency = $this->getCurrencyByCode($requestedCode);
            if ($currency && $currency->is_active) {
                return $currency;
            }
        }

        // 2. Check Authenticated User preference (TODO: Add to User model)
        // if (auth()->check() && auth()->user()->currency) { ... }

        // 3. Fallback to System Default (Display Default, distinct from Base)
        return Cache::remember('currency:default', self::CACHE_TTL, function () {
            return Currency::where('is_default', true)->first() 
                ?? $this->getBaseCurrency();
        });
    }

    /**
     * Get all active currencies for switcher.
     */
    public function getActiveCurrencies()
    {
        return Cache::remember('currency:active_list', self::CACHE_TTL, function () {
            return Currency::where('is_active', true)->get();
        });
    }

    /**
     * Validate and retrieve currency by code.
     */
    public function getCurrencyByCode(string $code): ?Currency
    {
        return Cache::remember("currency:code:{$code}", self::CACHE_TTL, function () use ($code) {
            return Currency::where('code', strtoupper($code))->first();
        });
    }

    /**
     * Clear currency caches (Admin use).
     */
    public function clearCache(): void
    {
        Cache::forget('currency:base');
        Cache::forget('currency:default');
        Cache::forget('currency:active_list');
        // Wildcard clearing depends on cache driver, simpler to just wait for TTL or loop codes if needed.
    }
}
