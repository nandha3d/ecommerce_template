<?php

namespace Core\System\Services;

use App\Models\Currency;

class CurrencyConversionService
{
    private CurrencyService $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        $this->currencyService = $currencyService;
    }

    /**
     * Convert amount from Base Currency to Target Currency.
     * STRICT: Input MUST be in Base Currency.
     * 
     * @param float $amount Amount in Base Currency
     * @param Currency|string|null $targetCurrency Target Currency object or code (null = user display currency)
     * @return float Converted amount
     */
    public function convertFromBase(float $amount, $targetCurrency = null): float
    {
        // 1. Resolve Target
        $target = $targetCurrency instanceof Currency 
            ? $targetCurrency 
            : $this->currencyService->getDisplayCurrency($targetCurrency);

        // 2. Optimization: If target is base, return as is.
        if ($target->is_base) {
            return $amount;
        }

        // 3. STRICT MATH: Amount * Exchange Rate
        // Usage of high precision math helpers is recommended but float is okay for display if careful.
        // DB stores rate as 1 USD = X Target.
        // So 10 USD = 10 * X.
        
        return $amount * $target->exchange_rate;
    }

    /**
     * Convert and Format for Display.
     * Returns: ["$10.00", "€9.20"]
     */
    public function format(float $amountInBase, $targetCurrency = null): string
    {
        $target = $targetCurrency instanceof Currency 
            ? $targetCurrency 
            : $this->currencyService->getDisplayCurrency($targetCurrency);

        $converted = $this->convertFromBase($amountInBase, $target);

        $decimals = $target->decimal_places;
        $value = number_format($converted, $decimals, '.', ',');

        return match ($target->symbol_position) {
            'before' => $target->symbol . $value,
            'after' => $value . $target->symbol,
            default => $target->symbol . $value,
        };
    }
}
