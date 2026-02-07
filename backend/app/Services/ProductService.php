<?php

namespace App\Services;

use App\Repositories\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Core\Product\Models\Product;

class ProductService
{
    protected ProductRepositoryInterface $productRepository;
    protected MediaService $mediaService;
    protected \App\Validators\VariantValidator $variantValidator;

    public function __construct(
        ProductRepositoryInterface $productRepository,
        MediaService $mediaService,
        \App\Validators\VariantValidator $variantValidator
    ) {
        $this->productRepository = $productRepository;
        $this->mediaService = $mediaService;
        $this->variantValidator = $variantValidator;
    }

    public function createProduct(array $data): Product
    {
        // ... (existing code)
    }

    // ... (existing helper methods)

    private function createVariants(Product $product, array $variants): void
    {
        // H10: Transaction Savepoints for potential granular error handling
        // For Strict Mode: We still fail ALL if one fails, but we wrap in savepoint 
        // to ensure we isolate this batch operation cleanly.
        
        foreach ($variants as $index => $variantData) {
            DB::beginTransaction(); // Savepoint (Nested Transaction in Laravel)
            try {
                // H9: Validation
                $this->variantValidator->validate($variantData);

                // Uniqueness Check
                if (ProductVariant::where('sku', $variantData['sku'])->exists()) {
                    throw new \InvalidArgumentException("SKU '{$variantData['sku']}' already exists.");
                }

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
                
                DB::commit(); // Release Savepoint
            } catch (\Exception $e) {
                DB::rollBack(); // Rollback to Savepoint
                // Re-throw to fail the whole request (Strict Mode)
                throw new \RuntimeException("Variant Creation Failed at index {$index} (SKU: {$variantData['sku']}): " . $e->getMessage(), 0, $e);
            }
        }
    }

    private function upsertVariants(Product $product, array $variants): void
    {
        $existingIds = [];
        
        // Safety: If array is empty, we would delete all. Prevent this.
        if (empty($variants) && $product->variants()->count() > 0) {
             throw new \RuntimeException("Cannot remove all variants. A product must have at least one sellable variant.");
        }

        foreach ($variants as $index => $variantData) {
            DB::beginTransaction(); // Savepoint
            try {
                // H9: Validation
                $this->variantValidator->validate($variantData);

                // Uniqueness Check (Exclude current variant if updating)
                $skuQuery = ProductVariant::where('sku', $variantData['sku']);
                if (isset($variantData['id'])) {
                    $skuQuery->where('id', '!=', $variantData['id']);
                }
                if ($skuQuery->exists()) {
                    throw new \InvalidArgumentException("SKU '{$variantData['sku']}' already exists.");
                }

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
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw new \RuntimeException("Variant Update Failed at index {$index} (SKU: {$variantData['sku']}): " . $e->getMessage(), 0, $e);
            }
        }

        // Integrity Check: Do not delete all if result is empty
        if (empty($existingIds)) {
             throw new \RuntimeException("Operation failed: Product would have 0 variants.");
        }

        // Delete variants not in request
        $product->variants()->whereNotIn('id', $existingIds)->delete();
    }

    private function createAddonGroups(Product $product, array $groups): void
    {
        foreach ($groups as $groupIndex => $groupData) {
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
}
