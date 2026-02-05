<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Core\Product\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * List products with filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'categories', 'images', 'variants']);
        
        // Only filter by active if not requesting all (for admin)
        if (!$request->boolean('include_all')) {
            $query->active();
        }

        // Search
        if ($search = $request->input('search')) {
            $query->search($search);
        }

        // Category filter
        if ($category = $request->input('category')) {
            $query->whereHas('categories', function ($q) use ($category) {
                $q->where('slug', $category);
            });
        }

        // Brand filter
        if ($brand = $request->input('brand')) {
            $query->whereHas('brand', function ($q) use ($brand) {
                $q->where('slug', $brand);
            });
        }

        // Price filter
        if ($minPrice = $request->input('min_price')) {
            $query->where(function ($q) use ($minPrice) {
                $q->where('sale_price', '>=', $minPrice)
                  ->orWhere(function ($q2) use ($minPrice) {
                      $q2->whereNull('sale_price')
                         ->where('price', '>=', $minPrice);
                  });
            });
        }

        if ($maxPrice = $request->input('max_price')) {
            $query->where(function ($q) use ($maxPrice) {
                $q->where('sale_price', '<=', $maxPrice)
                  ->orWhere(function ($q2) use ($maxPrice) {
                      $q2->whereNull('sale_price')
                         ->where('price', '<=', $maxPrice);
                  });
            });
        }

        // Rating filter
        if ($rating = $request->input('rating')) {
            $query->where('average_rating', '>=', $rating);
        }

        // In stock filter
        if ($request->boolean('in_stock')) {
            $query->where('stock_quantity', '>', 0);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        switch ($sortBy) {
            case 'popularity':
                $query->orderBy('review_count', 'desc');
                break;
            case 'price_asc':
                $query->orderByRaw('COALESCE(sale_price, price) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(sale_price, price) DESC');
                break;
            case 'rating':
                $query->orderBy('average_rating', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $perPage = min($request->input('per_page', 12), 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
            'links' => [
                'first' => $products->url(1),
                'last' => $products->url($products->lastPage()),
                'prev' => $products->previousPageUrl(),
                'next' => $products->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Show single product.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::with([
            'brand', 
            'categories', 
            'images', 
            'variants', 
            'addonGroups.options',
            'reviews' => function ($q) {
                $q->where('is_approved', true)->latest()->limit(10);
            }
        ])
        ->where('slug', $slug)
        ->active()
        ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * Get featured products.
     */
    public function featured(): JsonResponse
    {
        $products = Product::with(['brand', 'categories', 'images'])
                           ->featured()
                           ->limit(8)
                           ->get();

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
        ]);
    }

    /**
     * Get best sellers.
     */
    public function bestSellers(): JsonResponse
    {
        $products = Product::with(['brand', 'categories', 'images'])
                           ->bestSellers()
                           ->orderBy('review_count', 'desc')
                           ->limit(8)
                           ->get();

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
        ]);
    }

    /**
     * Get new arrivals.
     */
    public function newArrivals(): JsonResponse
    {
        $products = Product::with(['brand', 'categories', 'images'])
                           ->new()
                           ->orderBy('created_at', 'desc')
                           ->limit(8)
                           ->get();

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
        ]);
    }

    /**
     * Get related products.
     */
    public function related(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $categoryIds = $product->categories->pluck('id');
        
        $related = Product::with(['brand', 'categories', 'images'])
                          ->where('id', '!=', $id)
                          ->active()
                          ->whereHas('categories', function ($q) use ($categoryIds) {
                              $q->whereIn('categories.id', $categoryIds);
                          })
                          ->limit(4)
                          ->get();

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($related),
        ]);
    }

    /**
     * Get all categories.
     */
    public function categories(): JsonResponse
    {
        try {
            $categories = Category::whereNull('parent_id')
                                  ->with('children')
                                  ->orderBy('name')
                                  ->get();

            return response()->json([
                'success' => true,
                'data' => $categories,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all brands.
     */
    public function brands(): JsonResponse
    {
        $brands = Brand::withCount('products')
                       ->orderBy('name')
                       ->get();

        return response()->json([
            'success' => true,
            'data' => $brands,
        ]);
    }
}
