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
        return DB::transaction(function () use ($data) {
            $productData = array_intersect_key($data, array_flip([
                'name', 'slug', 'sku', 'description', 'short_description',
                'price', 'sale_price', 'stock_quantity', 'brand_id',
                'is_active', 'is_featured', 'is_new', 'is_bestseller',
                'seo_title', 'seo_description', 'ingredients',
                'weight', 'length', 'breadth', 'height',
                'is_digital', 'is_downloadable', 'download_limit', 'download_expiry_days',
                'has_customization', 'customization_fields', 'custom_tabs',
                'image_layout', 'specifications',
                'fssai_license', 'batch_no', 'manufacturing_date', 'expiry_date',
                'origin_country', 'hs_code', 'is_returnable', 'return_policy_days',
                'stock_threshold', 'nutrition_facts', 'benefits', 'tags',
                'video_link', 'og_title', 'og_description', 'og_image',
                'twitter_title', 'twitter_description', 'twitter_image',
                'include_in_sitemap', 'sitemap_priority', 'sitemap_change_frequency'
            ]));

            if (!isset($productData['slug']) && isset($productData['name'])) {
                $productData['slug'] = Str::slug($productData['name']);
            }

            $product = Product::create($productData);

            if (isset($data['category_ids'])) {
                $product->categories()->sync($data['category_ids']);
            }

            if (isset($data['images']) && is_array($data['images'])) {
                $this->syncImages($product, $data['images']);
            }

            if (isset($data['variants']) && is_array($data['variants'])) {
                $this->upsertVariants($product, $data['variants']);
            }

            if (isset($data['addon_groups'])) {
                $this->createAddonGroups($product, $data['addon_groups']);
            }

            return $product->load(['brand', 'categories', 'images', 'variants', 'addonGroups.options']);
        });
    }

    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            // Update basic product details
            $productData = array_intersect_key($data, array_flip([
                'name', 'slug', 'sku', 'description', 'short_description',
                'price', 'sale_price', 'stock_quantity', 'brand_id',
                'is_active', 'is_featured', 'is_new', 'is_bestseller',
                'seo_title', 'seo_description', 'ingredients',
                'weight', 'length', 'breadth', 'height',
                'is_digital', 'is_downloadable', 'download_limit', 'download_expiry_days',
                'has_customization', 'customization_fields', 'custom_tabs',
                'image_layout', 'specifications',
                'fssai_license', 'batch_no', 'manufacturing_date', 'expiry_date',
                'origin_country', 'hs_code', 'is_returnable', 'return_policy_days',
                'stock_threshold', 'nutrition_facts', 'benefits', 'tags',
                'video_link', 'og_title', 'og_description', 'og_image',
                'twitter_title', 'twitter_description', 'twitter_image',
                'include_in_sitemap', 'sitemap_priority', 'sitemap_change_frequency'
            ]));

            // Generate slug if name changed and slug not provided
            if (!isset($data['slug']) && isset($data['name']) && $data['name'] !== $product->name) {
                $productData['slug'] = Str::slug($data['name']);
            }

            $product->update($productData);

            // Sync categories (many-to-many relationship)
            if (isset($data['category_ids'])) {
                $product->categories()->sync($data['category_ids']);
            }

            // Handle Images
            if (isset($data['images']) && is_array($data['images'])) {
                $this->syncImages($product, $data['images']);
            }

            // Handle Variants
            if (isset($data['variants']) && is_array($data['variants'])) {
                if (empty($data['variants'])) {
                    // Cannot remove all variants
                    throw new \RuntimeException("Product must have at least one variant.");
                }
                $this->upsertVariants($product, $data['variants']);
            }

            // Handle Addon Groups
            if (isset($data['addon_groups'])) {
                // Delete existing addon groups (cascade will delete options)
                $product->addonGroups()->delete();
                
                if (!empty($data['addon_groups'])) {
                    $this->createAddonGroups($product, $data['addon_groups']);
                }
            }

            // Reload relationships for response
            return $product->load([
                'brand', 
                'categories', 
                'images', 
                'variants', 
                'addonGroups.options'
            ]);
        });
    }

    /**
     * Sync product images (create, update, delete)
     */
    private function syncImages(Product $product, array $images): void
    {
        $existingIds = [];
        
        foreach ($images as $index => $imageData) {
            if (isset($imageData['id'])) {
                // Update existing image
                $image = ProductImage::find($imageData['id']);
                if ($image && $image->product_id === $product->id) {
                    $image->update([
                        'url' => $imageData['url'],
                        'alt_text' => $imageData['alt_text'] ?? null,
                        'is_primary' => $imageData['is_primary'] ?? false,
                        'sort_order' => $index,
                    ]);
                    $existingIds[] = $image->id;
                }
            } else {
                // Create new image
                $image = ProductImage::create([
                    'product_id' => $product->id,
                    'url' => $imageData['url'],
                    'alt_text' => $imageData['alt_text'] ?? null,
                    'is_primary' => $imageData['is_primary'] ?? false,
                    'sort_order' => $index,
                ]);
                $existingIds[] = $image->id;
            }
        }
        
        // Delete images not in the request
        $product->images()->whereNotIn('id', $existingIds)->delete();
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
                        $variant->update(array_intersect_key($variantData, array_flip([
                            'sku', 'name', 'price', 'sale_price', 'cost_price', 
                            'stock_quantity', 'low_stock_threshold', 'attributes', 
                            'image', 'weight', 'length', 'breadth', 'height', 
                            'is_active', 'manufacturer_code', 'barcode'
                        ])));
                        $existingIds[] = $variant->id;
                    }
                } else {
                    $variant = ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $variantData['sku'],
                        'name' => $variantData['name'] ?? null,
                        'price' => $variantData['price'],
                        'sale_price' => $variantData['sale_price'] ?? null,
                        'cost_price' => $variantData['cost_price'] ?? null,
                        'stock_quantity' => $variantData['stock_quantity'] ?? 0,
                        'low_stock_threshold' => $variantData['low_stock_threshold'] ?? 10,
                        'attributes' => $variantData['attributes'] ?? [],
                        'image' => $variantData['image'] ?? null,
                        'weight' => $variantData['weight'] ?? null,
                        'length' => $variantData['length'] ?? null,
                        'breadth' => $variantData['breadth'] ?? null,
                        'height' => $variantData['height'] ?? null,
                        'is_active' => $variantData['is_active'] ?? true,
                        'manufacturer_code' => $variantData['manufacturer_code'] ?? null,
                        'barcode' => $variantData['barcode'] ?? null,
                    ]);
                    $existingIds[] = $variant->id;
                }
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw new \RuntimeException("Variant Update Failed at index {$index} (SKU: " . ($variantData['sku'] ?? 'N/A') . "): " . $e->getMessage(), 0, $e);
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
