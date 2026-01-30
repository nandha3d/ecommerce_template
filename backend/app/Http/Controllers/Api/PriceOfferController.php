<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PriceOffer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PriceOfferController extends Controller
{
    /**
     * Get all offers
     */
    public function index(): JsonResponse
    {
        $offers = PriceOffer::with('products')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $offers,
        ]);
    }

    /**
     * Get active offers for customers
     */
    public function active(): JsonResponse
    {
        $offers = PriceOffer::valid()
            ->with('products')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $offers,
        ]);
    }

    /**
     * Get a single offer
     */
    public function show(int $id): JsonResponse
    {
        $offer = PriceOffer::with('products')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $offer,
        ]);
    }

    /**
     * Create a new offer
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:price_offers,slug',
            'description' => 'nullable|string',
            'type' => 'required|in:flash_sale,bulk_discount,bogo,tiered,percentage,fixed',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'conditions' => 'nullable|array',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $offer = PriceOffer::create($validated);

        if (!empty($validated['product_ids'])) {
            $offer->products()->attach($validated['product_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Offer created successfully',
            'data' => $offer->load('products'),
        ], 201);
    }

    /**
     * Update an offer
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $offer = PriceOffer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:price_offers,slug,' . $id,
            'description' => 'nullable|string',
            'type' => 'sometimes|in:flash_sale,bulk_discount,bogo,tiered,percentage,fixed',
            'discount_type' => 'sometimes|in:percentage,fixed',
            'discount_value' => 'sometimes|numeric|min:0',
            'conditions' => 'nullable|array',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'is_active' => 'boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $offer->update($validated);

        if (isset($validated['product_ids'])) {
            $offer->products()->sync($validated['product_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Offer updated successfully',
            'data' => $offer->load('products'),
        ]);
    }

    /**
     * Delete an offer
     */
    public function destroy(int $id): JsonResponse
    {
        $offer = PriceOffer::findOrFail($id);
        $offer->products()->detach();
        $offer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Offer deleted successfully',
        ]);
    }

    /**
     * Calculate discount for a product
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'price' => 'required|numeric|min:0',
            'quantity' => 'integer|min:1',
        ]);

        $offers = PriceOffer::valid()
            ->whereHas('products', function ($q) use ($validated) {
                $q->where('products.id', $validated['product_id']);
            })
            ->get();

        $bestDiscount = 0;
        $appliedOffer = null;

        foreach ($offers as $offer) {
            $discount = $offer->calculateDiscount(
                $validated['price'],
                $validated['quantity'] ?? 1
            );
            
            if ($discount > $bestDiscount) {
                $bestDiscount = $discount;
                $appliedOffer = $offer;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'original_price' => $validated['price'],
                'discount' => $bestDiscount,
                'final_price' => $validated['price'] - $bestDiscount,
                'applied_offer' => $appliedOffer,
            ],
        ]);
    }
}
