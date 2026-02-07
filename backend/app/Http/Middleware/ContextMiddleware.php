<?php

namespace App\Http\Middleware;

use Closure;
use Core\System\Services\CurrencyService;
use Core\System\Services\TimezoneService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContextMiddleware
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
     * Handle an incoming request.
     * Injects context headers into response for frontend sync.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only for JSON responses logic
        if ($response instanceof \Illuminate\Http\JsonResponse) {
            
            // Resolve Current Context
            $currencyCode = $request->header('X-Currency') ?? $request->cookie('currency');
            $currency = $this->currencyService->getDisplayCurrency($currencyCode);

            $timezoneId = $request->header('X-Timezone') ?? $request->cookie('timezone');
            $timezone = $this->timezoneService->getUserTimezone($timezoneId);

            // Inject headers so frontend is always aware of "used" context
            $response->headers->set('X-Context-Currency', $currency->code);
            $response->headers->set('X-Context-Timezone', $timezone->identifier);
        }

        return $response;
    }
}
