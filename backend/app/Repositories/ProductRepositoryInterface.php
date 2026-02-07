<?php

namespace App\Repositories;

use Core\Product\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function getAll(array $filters = [], int $perPage = 20): LengthAwarePaginator;
    public function find(int $id): ?Product;
    public function create(array $data): Product;
    public function update(Product $product, array $data): Product;
    public function delete(Product $product): bool;
    public function bulkDelete(array $ids): int;
    public function bulkUpdateStatus(array $ids, bool $isActive): int;
    public function bulkUpdateFeature(array $ids, bool $isFeatured): int;
}
