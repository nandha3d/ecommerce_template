<?php

namespace App\Repositories;

use Core\Product\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Enums\Product\ProductStatus;

class ProductRepository implements ProductRepositoryInterface
{
    public function getAll(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Product::with(['brand', 'categories', 'images', 'variants'])
            ->when(isset($filters['search']), fn($q) => $q->search($filters['search']))
            ->when(isset($filters['category_id']), fn($q) => $q->whereHas('categories', fn($c) => $c->where('id', $filters['category_id'])))
            ->when(isset($filters['brand_id']), fn($q) => $q->where('brand_id', $filters['brand_id']))
            ->when(isset($filters['status']), fn($q) => $q->where('status', $filters['status']))
            ->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_direction'] ?? 'desc');

        return $query->paginate($perPage);
    }

    public function find(int $id): ?Product
    {
        return Product::with(['brand', 'categories', 'images', 'variants', 'addonGroups.options'])->find($id);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        return $product;
    }

    public function delete(Product $product): bool
    {
        return $product->delete();
    }

    public function bulkDelete(array $ids): int
    {
        return Product::destroy($ids);
    }

    public function bulkUpdateStatus(array $ids, bool $isActive): int
    {
        return Product::whereIn('id', $ids)->update(['is_active' => $isActive]);
    }

    public function bulkUpdateFeature(array $ids, bool $isFeatured): int
    {
        return Product::whereIn('id', $ids)->update(['is_featured' => $isFeatured]);
    }
}
