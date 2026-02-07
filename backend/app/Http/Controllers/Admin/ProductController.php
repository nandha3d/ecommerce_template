<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use App\Repositories\ProductRepositoryInterface;
use App\Http\Requests\Admin\Product\StoreProductRequest;
use App\Http\Requests\Admin\Product\UpdateProductRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Core\Product\Models\Product; // Fixed Use Statement to match AuthorizeResource

class ProductController extends Controller
{
    private ProductService $productService;
    private ProductRepositoryInterface $productRepository;

    public function __construct(
        ProductService $productService,
        ProductRepositoryInterface $productRepository
    ) {
        $this->productService = $productService;
        $this->productRepository = $productRepository;
        $this->authorizeResource(Product::class, 'product');
    }

    /**
     * List all products for admin.
     */
    public function index(Request $request): JsonResponse
    {
        $default = config('pagination.admin.default', 20);
        $max = config('pagination.admin.max', 100);
        $perPage = min($request->input('per_page', $default), $max);
        $filters = $request->all();

        $products = $this->productRepository->getAll($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get single product for editing.
     */
    public function show(int $id): JsonResponse
    {
        $product = $this->productRepository->find($id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Create new product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        try {
            $product = $this->productService->createProduct($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product->load(['brand', 'categories', 'images', 'variants', 'addonGroups.options']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update product.
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        try {
            $product = $this->productService->updateProduct($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete product.
     */
    public function destroy(int $id): JsonResponse
    {
        $product = $this->productRepository->find($id);
        
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        $this->productRepository->delete($product);

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Bulk actions.
     */
    public function bulk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:delete,activate,deactivate,feature,unfeature',
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:products,id',
        ]);

        $count = 0;
        
        switch ($validated['action']) {
            case 'delete':
                $count = $this->productRepository->bulkDelete($validated['ids']);
                break;
            case 'activate':
                $count = $this->productRepository->bulkUpdateStatus($validated['ids'], true);
                break;
            case 'deactivate':
                $count = $this->productRepository->bulkUpdateStatus($validated['ids'], false);
                break;
            case 'feature':
                $count = $this->productRepository->bulkUpdateFeature($validated['ids'], true);
                break;
            case 'unfeature':
                $count = $this->productRepository->bulkUpdateFeature($validated['ids'], false);
                break;
        }

        return response()->json([
            'success' => true,
            'message' => "Bulk action applied to {$count} products",
        ]);
    }
}
