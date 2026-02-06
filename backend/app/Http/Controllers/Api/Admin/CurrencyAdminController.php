<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Core\System\Services\CurrencyService;

class CurrencyAdminController extends Controller
{
    private CurrencyService $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        $this->currencyService = $currencyService;
    }

    /**
     * List all currencies (Admin).
     */
    public function index(): JsonResponse
    {
        $currencies = Currency::all();
        return response()->json(['data' => $currencies]);
    }

    /**
     * Create a new currency.
     * STRICT: Only one base currency allowed.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|size:3|unique:currencies,code',
            'name' => 'required|string|max:100',
            'symbol' => 'required|string|max:10',
            'symbol_position' => 'required|in:before,after',
            'decimal_places' => 'required|integer|min:0|max:4',
            'exchange_rate' => 'required|numeric|min:0.0001',
            'is_base' => 'boolean',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // STRICT: Only one base currency allowed
        $isBase = $validated['is_base'] ?? false;
        if ($isBase && Currency::where('is_base', true)->exists()) {
            return response()->json(['error' => 'A base currency already exists. Only one base currency is allowed.'], 400);
        }

        // If this is the first currency, make it base and default
        if (Currency::count() === 0) {
            $validated['is_base'] = true;
            $validated['is_default'] = true;
            $validated['exchange_rate'] = 1.0;
        }

        // If setting as default, clear other defaults
        if ($validated['is_default'] ?? false) {
            Currency::where('is_default', true)->update(['is_default' => false]);
        }

        $currency = Currency::create($validated);
        $this->currencyService->clearCache();

        return response()->json([
            'message' => 'Currency created successfully',
            'data' => $currency
        ], 201);
    }

    /**
     * Update a currency.
     * STRICT: Cannot modify is_base of existing currency.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $currency = Currency::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'symbol' => 'sometimes|string|max:10',
            'symbol_position' => 'sometimes|in:before,after',
            'decimal_places' => 'sometimes|integer|min:0|max:4',
            'exchange_rate' => 'sometimes|numeric|min:0.0001',
            'is_active' => 'sometimes|boolean',
        ]);

        // STRICT: Cannot change exchange rate of base currency
        if ($currency->is_base && isset($validated['exchange_rate']) && $validated['exchange_rate'] != 1) {
            return response()->json(['error' => 'Base currency exchange rate must always be 1'], 400);
        }

        // STRICT: Cannot deactivate base currency
        if ($currency->is_base && isset($validated['is_active']) && !$validated['is_active']) {
            return response()->json(['error' => 'Cannot deactivate base currency'], 400);
        }

        $currency->update($validated);
        $this->currencyService->clearCache();

        return response()->json(['message' => 'Currency updated', 'data' => $currency]);
    }

    /**
     * Delete a currency.
     * STRICT: Cannot delete base currency.
     */
    public function destroy(int $id): JsonResponse
    {
        $currency = Currency::findOrFail($id);

        if ($currency->is_base) {
            return response()->json(['error' => 'Cannot delete base currency'], 400);
        }

        if ($currency->is_default) {
            return response()->json(['error' => 'Cannot delete default currency. Set another currency as default first.'], 400);
        }

        $currency->delete();
        $this->currencyService->clearCache();

        return response()->json(['message' => 'Currency deleted successfully']);
    }

    /**
     * Toggle active status.
     * STRICT: Cannot deactivate Base Currency.
     */
    public function toggleActive(int $id): JsonResponse
    {
        $currency = Currency::findOrFail($id);

        if ($currency->is_base) {
            return response()->json(['error' => 'Cannot deactivate Base Currency'], 400);
        }

        $currency->update(['is_active' => !$currency->is_active]);
        $this->currencyService->clearCache();

        return response()->json(['message' => 'Status updated', 'data' => $currency]);
    }

    /**
     * Set System Default (Display).
     */
    public function setDefault(int $id): JsonResponse
    {
        $currency = Currency::findOrFail($id);
        
        if (!$currency->is_active) {
            return response()->json(['error' => 'Cannot set inactive currency as default'], 400);
        }

        // Reset others
        Currency::where('is_default', true)->update(['is_default' => false]);
        
        $currency->update(['is_default' => true]);
        $this->currencyService->clearCache();

        return response()->json(['message' => 'Default currency updated', 'data' => $currency]);
    }
}
