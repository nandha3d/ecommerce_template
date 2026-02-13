<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Search products with filters and pagination.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q');
        
        if (empty($query)) {
            return $this->success([], 'Empty search query');
        }

        $products = Product::query()
            ->with(['images', 'variants'])
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('sku', 'LIKE', "%{$query}%");
            })
            ->where('is_active', true)
            ->paginate($request->input('per_page', 12));

        return $this->success($products, 'Search results retrieved');
    }

    /**
     * Get search suggestions for real-time results.
     */
    public function suggestions(Request $request): JsonResponse
    {
        $query = $request->input('q');

        if (strlen($query) < 2) {
            return $this->success([], 'Query too short');
        }

        $suggestions = Product::query()
            ->select('id', 'name', 'slug')
            ->where('name', 'LIKE', "%{$query}%")
            ->where('is_active', true)
            ->limit(8)
            ->get();

        return $this->success($suggestions, 'Suggestions retrieved');
    }
}
