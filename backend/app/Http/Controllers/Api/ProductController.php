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

        // Price filter (Via Variants)
        if ($minPrice = $request->input('min_price')) {
            $query->whereHas('variants', function ($q) use ($minPrice) {
                $q->where(function ($sub) use ($minPrice) {
                    $sub->where('sale_price', '>=', $minPrice)
                        ->orWhere(function ($sub2) use ($minPrice) {
                            $sub2->whereNull('sale_price')
                                 ->where('price', '>=', $minPrice);
                        });
                })->where('is_active', true);
            });
        }

        if ($maxPrice = $request->input('max_price')) {
            $query->whereHas('variants', function ($q) use ($maxPrice) {
                $q->where(function ($sub) use ($maxPrice) {
                    $sub->where('sale_price', '<=', $maxPrice)
                        ->orWhere(function ($sub2) use ($maxPrice) {
                            $sub2->whereNull('sale_price')
                                 ->where('price', '<=', $maxPrice);
                        });
                })->where('is_active', true);
            });
        }

        // Rating filter
        if ($rating = $request->input('rating')) {
            $query->where('average_rating', '>=', $rating);
        }

        // In stock filter (Via Variants)
        if ($request->boolean('in_stock')) {
            $query->whereHas('variants', function ($q) {
                $q->where('stock_quantity', '>', 0)
                  ->where('is_active', true);
            });
        }

        // Sorting
        $sortConfig = config('sorting.products.options');
        $sortBy = $request->input('sort_by', config('sorting.products.default', 'newest'));

        if (array_key_exists($sortBy, $sortConfig)) {
            $config = $sortConfig[$sortBy];
            if (isset($config['relation_min'])) {
                 list($relation, $column) = $config['relation_min'];
                 $query->withMin($relation, $column)->orderBy($config['field'], $config['direction']);
            } elseif (isset($config['relation_max'])) {
                 list($relation, $column) = $config['relation_max'];
                 $query->withMax($relation, $column)->orderBy($config['field'], $config['direction']);
            } else {
                 $query->orderBy($config['field'], $config['direction']);
            }
        } else {
             // Fallback
             $query->orderBy('created_at', 'desc');
        }

        $defaultPerPage = config('pagination.products.default', 12);
        $maxPerPage = config('pagination.products.max', 50);
        $perPage = min($request->input('per_page', $defaultPerPage), $maxPerPage);
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
                           ->limit(config('pagination.products.featured', 8))
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
                           ->limit(config('pagination.products.bestsellers', 8))
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
                           ->limit(config('pagination.products.new_arrivals', 8))
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
                          ->limit(config('pagination.products.related', 4))
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
                                  ->withCount('products')
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
