<?php

namespace Core\System\Services;

use App\Models\Currency;
use App\Models\CurrencyRate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateProvider
{
    // Configure in .env
    private string $providerUrl = 'https://api.exchangerate.host/latest'; // Example
    private string $apiKey;

    public function __construct() {
        $this->apiKey = config('services.currency.key', '');
    }

    /**
     * Fetch and update rates relative to Base Currency.
     * STRICT rule: Source must be Base Currency.
     */
    public function updateRates(): void
    {
        $base = Currency::base()->first();
        
        if (!$base) {
            Log::error('Globalization: No base currency found.');
            return;
        }

        try {
            Log::info("Globalization: Fetching rates for Base {$base->code}");
            
            // Use Frankfurter API (Open Source, No Key Required)
            // https://api.frankfurter.app/latest?from=USD
            $response = Http::get('https://api.frankfurter.app/latest', [
                'from' => $base->code,
            ]);

            if ($response->failed()) {
                throw new \Exception("API Request failed: " . $response->body());
            }

            $rates = $response->json()['rates'] ?? [];
            
            $activeCurrencies = Currency::where('id', '!=', $base->id)->get();
            
            foreach ($activeCurrencies as $currency) {
                $rate = $rates[$currency->code] ?? null;
                
                if ($rate) {
                     $currency->update(['exchange_rate' => $rate]);
                     
                     CurrencyRate::create([
                         'source_currency_id' => $base->id,
                         'target_currency_id' => $currency->id,
                         'rate' => $rate,
                         'fetched_at' => now(),
                         'provider' => 'frankfurter'
                     ]);
                     
                     Log::info("Updated rate for {$currency->code}: {$rate}");
                } else {
                    Log::warning("Rate not found for {$currency->code}");
                }
            }

            // Clear cache
            // (Ideally call CurrencyService here, but directly clearing cache key is acceptable for command)
            \Illuminate\Support\Facades\Cache::forget('currency:active_list');

        } catch (\Exception $e) {
            Log::error("Globalization: Rate update failed: " . $e->getMessage());
        }
    }
}
