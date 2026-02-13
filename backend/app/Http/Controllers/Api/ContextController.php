<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Core\System\Services\CurrencyService;
use Core\System\Services\TimezoneService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContextController extends Controller
{
    private CurrencyService $currencyService;
    private TimezoneService $timezoneService;

    public function __construct(
        CurrencyService $currencyService,
        TimezoneService $timezoneService
    ) {
        $this->currencyService = $currencyService;
        $this->timezoneService = $timezoneService;
    }

    /**
     * GET /api/context
     * Returns unified context for the frontend.
     */
    public function getContext(Request $request): JsonResponse
    {
        // 1. Detect requested settings (from Header or Cookie)
        $currencyCode = $request->header('X-Currency') ?? $request->cookie('currency');
        $timezoneId = $request->header('X-Timezone') ?? $request->cookie('timezone');

        // 2. Resolve final settings
        $currency = $this->currencyService->getDisplayCurrency($currencyCode);
        $timezone = $this->timezoneService->getUserTimezone($timezoneId);
        
        // 3. Get Active Lists (for switchers)
        $currencies = $this->currencyService->getActiveCurrencies()->map(function($c) {
             return [
                 'code' => $c->code,
                 'symbol' => $c->symbol,
                 'name' => $c->name,
                 'is_default' => $c->is_default
             ];
        });

        // 4. Get Theme Settings (Public)
        $themeSettings = \Core\System\Models\SiteSetting::where('key', 'like', 'theme.%')
            ->where('is_public', true)
            ->get()
            ->mapWithKeys(fn($s) => [str_replace('theme.', '', $s->key) => $s->value]);

        // Default Theme (Gold Rush) if not set
        $theme = array_merge([
            'preset_id' => 'gold-rush',
            'primary' => '#d4af37',
            'secondary' => '#1a1a1a',
            'accent' => '#ffffff',
            'bg' => '#fcfcfc',
            'surface' => '#ffffff',
            'border' => '#f3f4f6',
            'text' => '#1a1a1a',
            'muted' => '#9ca3af',
        ], $themeSettings->toArray());

        // 5. Return consolidated payload
        return response()->json([
            'currency' => [
                'active_code' => $currency->code, // The resolved currency
                'symbol' => $currency->symbol,
                'position' => $currency->symbol_position,
                'decimals' => $currency->decimal_places,
                'exchange_rate' => $currency->exchange_rate, 
                'available' => $currencies,
            ],
            'timezone' => [
                'identifier' => $timezone->identifier,
                'offset' => $timezone->offset,
            ],
            'theme' => $theme,
        ]);
    }
}
