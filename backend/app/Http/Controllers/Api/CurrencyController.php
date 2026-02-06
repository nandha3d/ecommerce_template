<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Core\System\Services\CurrencyService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cookie;

class CurrencyController extends Controller
{
    private CurrencyService $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        $this->currencyService = $currencyService;
    }

    /**
     * List active currencies.
     */
    public function index(): JsonResponse
    {
        $currencies = $this->currencyService->getActiveCurrencies();
        return response()->json(['data' => $currencies]);
    }

    /**
     * Switch Display Currency.
     * Sets a long-lived cookie.
     */
    public function switch(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|exists:currencies,code,is_active,1',
        ]);

        $code = $request->input('code');
        
        // TODO: If auth, update user profile.

        // Queue cookie for 1 year
        $cookie = Cookie::make('currency', $code, 60 * 24 * 365, null, null, false, false);

        return response()->json([
            'message' => 'Currency updated',
            'currency' => $this->currencyService->getCurrencyByCode($code)
        ])->withCookie($cookie);
    }
}
