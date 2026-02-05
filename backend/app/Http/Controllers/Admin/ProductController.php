<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Core\Product\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * List all products for admin with extended data.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'categories', 'images', 'variants'])
            ->withTrashed($request->boolean('include_deleted'));

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            switch ($status) {
                case 'active':
                    $query->where('is_active', true)->where('stock_quantity', '>', 0);
                    break;
                case 'draft':
                    $query->where('is_active', false);
                    break;
                case 'out_of_stock':
                    $query->where('stock_quantity', 0);
                    break;
            }
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = min($request->input('per_page', 20), 100);
        $products = $query->paginate($perPage);

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
        $product = Product::with([
            'brand',
            'categories',
            'images' => fn($q) => $q->orderBy('sort_order'),
            'variants' => fn($q) => $q->orderBy('id'),
            'addonGroups.options',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Create new product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'integer|min:0',
            'brand_id' => 'nullable|exists:brands,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'is_bestseller' => 'boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'nutrition_facts' => 'nullable|array',
            'ingredients' => 'nullable|string',
            'benefits' => 'nullable|array',
            'tags' => 'nullable|array',
            // New fields
            'is_digital' => 'boolean',
            'is_downloadable' => 'boolean',
            'download_limit' => 'nullable|integer|min:1',
            'download_expiry_days' => 'nullable|integer|min:1',
            'has_customization' => 'boolean',
            'customization_fields' => 'nullable|array',
            'custom_tabs' => 'nullable|array',
            'image_layout' => 'nullable|in:horizontal,vertical',
            'addon_groups' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            // Generate slug
            $validated['slug'] = Str::slug($validated['name']);
            
            // Ensure unique slug
            $baseSlug = $validated['slug'];
            $counter = 1;
            while (Product::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $baseSlug . '-' . $counter++;
            }

            $product = Product::create($validated);

            // Sync categories
            if (!empty($request->category_ids)) {
                $product->categories()->sync($request->category_ids);
            }

            // Handle images
            if ($request->has('images')) {
                foreach ($request->images as $index => $imageData) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'url' => $imageData['url'],
                        'alt_text' => $imageData['alt_text'] ?? $product->name,
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Handle variants
            if ($request->has('variants')) {
                foreach ($request->variants as $variantData) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $variantData['sku'],
                        'name' => $variantData['name'] ?? null,
                        'price' => $variantData['price'],
                        'sale_price' => $variantData['sale_price'] ?? null,
                        'stock_quantity' => $variantData['stock_quantity'] ?? 0,
                        'attributes' => $variantData['attributes'] ?? [],
                        'image' => $variantData['image'] ?? null,
                        'is_active' => $variantData['is_active'] ?? true,
                    ]);
                }
            }

            // Handle addon groups
            if ($request->has('addon_groups')) {
                foreach ($request->addon_groups as $groupIndex => $groupData) {
                    $group = \App\Models\ProductAddonGroup::create([
                        'product_id' => $product->id,
                        'name' => $groupData['name'],
                        'selection_type' => $groupData['selection_type'] ?? 'multiple',
                        'is_required' => $groupData['is_required'] ?? false,
                        'min_selections' => $groupData['min_selections'] ?? 0,
                        'max_selections' => $groupData['max_selections'] ?? null,
                        'sort_order' => $groupIndex,
                    ]);

                    if (!empty($groupData['options'])) {
                        foreach ($groupData['options'] as $optIndex => $optData) {
                            \App\Models\ProductAddonOption::create([
                                'addon_group_id' => $group->id,
                                'name' => $optData['name'],
                                'price' => $optData['price'] ?? 0,
                                'is_default' => $optData['is_default'] ?? false,
                                'sort_order' => $optIndex,
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product->load(['brand', 'categories', 'images', 'variants', 'addonGroups.options']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
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
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|string|unique:products,sku,' . $id,
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'integer|min:0',
            'brand_id' => 'nullable|exists:brands,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'is_bestseller' => 'boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'nutrition_facts' => 'nullable|array',
            'ingredients' => 'nullable|string',
            'benefits' => 'nullable|array',
            'tags' => 'nullable|array',
            // New fields
            'is_digital' => 'boolean',
            'is_downloadable' => 'boolean',
            'download_limit' => 'nullable|integer|min:1',
            'download_expiry_days' => 'nullable|integer|min:1',
            'has_customization' => 'boolean',
            'customization_fields' => 'nullable|array',
            'custom_tabs' => 'nullable|array',
            'image_layout' => 'nullable|in:horizontal,vertical',
            'addon_groups' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            // Update slug if name changed
            if (isset($validated['name']) && $validated['name'] !== $product->name) {
                $validated['slug'] = Str::slug($validated['name']);
                $baseSlug = $validated['slug'];
                $counter = 1;
                while (Product::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                    $validated['slug'] = $baseSlug . '-' . $counter++;
                }
            }

            $product->update($validated);

            // Sync categories
            if ($request->has('category_ids')) {
                $product->categories()->sync($request->category_ids);
            }

            // Handle images (replace all)
            if ($request->has('images')) {
                $product->images()->delete();
                foreach ($request->images as $index => $imageData) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'url' => $imageData['url'],
                        'alt_text' => $imageData['alt_text'] ?? $product->name,
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Handle variants (upsert)
            if ($request->has('variants')) {
                $existingIds = [];
                foreach ($request->variants as $variantData) {
                    if (isset($variantData['id'])) {
                        $variant = ProductVariant::find($variantData['id']);
                        if ($variant && $variant->product_id === $product->id) {
                            $variant->update($variantData);
                            $existingIds[] = $variant->id;
                        }
                    } else {
                        $variant = ProductVariant::create([
                            'product_id' => $product->id,
                            'sku' => $variantData['sku'],
                            'name' => $variantData['name'] ?? null,
                            'price' => $variantData['price'],
                            'sale_price' => $variantData['sale_price'] ?? null,
                            'stock_quantity' => $variantData['stock_quantity'] ?? 0,
                            'attributes' => $variantData['attributes'] ?? [],
                            'image' => $variantData['image'] ?? null,
                            'is_active' => $variantData['is_active'] ?? true,
                        ]);
                        $existingIds[] = $variant->id;
                    }
                }
                // Delete variants not in the request
                $product->variants()->whereNotIn('id', $existingIds)->delete();
            }

            // Handle addon groups (replace all)
            if ($request->has('addon_groups')) {
                $product->addonGroups()->delete(); // Cascade deletes options
                foreach ($request->addon_groups as $groupIndex => $groupData) {
                    $group = \App\Models\ProductAddonGroup::create([
                        'product_id' => $product->id,
                        'name' => $groupData['name'],
                        'selection_type' => $groupData['selection_type'] ?? 'multiple',
                        'is_required' => $groupData['is_required'] ?? false,
                        'min_selections' => $groupData['min_selections'] ?? 0,
                        'max_selections' => $groupData['max_selections'] ?? null,
                        'sort_order' => $groupIndex,
                    ]);

                    if (!empty($groupData['options'])) {
                        foreach ($groupData['options'] as $optIndex => $optData) {
                            \App\Models\ProductAddonOption::create([
                                'addon_group_id' => $group->id,
                                'name' => $optData['name'],
                                'price' => $optData['price'] ?? 0,
                                'is_default' => $optData['is_default'] ?? false,
                                'sort_order' => $optIndex,
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product->fresh(['brand', 'categories', 'images', 'variants', 'addonGroups.options']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
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
        $product = Product::findOrFail($id);
        $product->delete();

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
                $count = Product::whereIn('id', $validated['ids'])->delete();
                break;
            case 'activate':
                $count = Product::whereIn('id', $validated['ids'])->update(['is_active' => true]);
                break;
            case 'deactivate':
                $count = Product::whereIn('id', $validated['ids'])->update(['is_active' => false]);
                break;
            case 'feature':
                $count = Product::whereIn('id', $validated['ids'])->update(['is_featured' => true]);
                break;
            case 'unfeature':
                $count = Product::whereIn('id', $validated['ids'])->update(['is_featured' => false]);
                break;
        }

        return response()->json([
            'success' => true,
            'message' => "Bulk action applied to {$count} products",
        ]);
    }
}
