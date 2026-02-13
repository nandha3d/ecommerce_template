<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaxRate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaxAdminController extends Controller
{
    /**
     * Display a listing of tax rates.
     */
    public function index(Request $request): JsonResponse
    {
        $taxRates = TaxRate::orderBy('country')->orderBy('state')->get();

        return response()->json([
            'success' => true,
            'data' => $taxRates
        ]);
    }

    /**
     * Store a newly created tax rate.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country' => 'required|string|max:2',
            'state' => 'nullable|string|max:255',
            'tax_type' => 'required|string|max:50', // e.g., VAT, GST, Sales Tax
            'rate' => 'required|numeric|min:0|max:100',
            'effective_from' => 'required|date',
            'effective_until' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean'
        ]);

        $taxRate = TaxRate::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tax rate created successfully',
            'data' => $taxRate
        ], 201);
    }

    /**
     * Update the specified tax rate.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $taxRate = TaxRate::find($id);

        if (!$taxRate) {
            return response()->json(['success' => false, 'message' => 'Tax rate not found'], 404);
        }

        $validated = $request->validate([
            'country' => 'sometimes|string|max:2',
            'state' => 'nullable|string|max:255',
            'tax_type' => 'sometimes|string|max:50',
            'rate' => 'sometimes|numeric|min:0|max:100',
            'effective_from' => 'sometimes|date',
            'effective_until' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean'
        ]);

        $taxRate->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tax rate updated successfully',
            'data' => $taxRate
        ]);
    }

    /**
     * Remove the specified tax rate.
     */
    public function destroy($id): JsonResponse
    {
        $taxRate = TaxRate::find($id);

        if (!$taxRate) {
            return response()->json(['success' => false, 'message' => 'Tax rate not found'], 404);
        }

        $taxRate->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tax rate deleted successfully'
        ]);
    }
}
