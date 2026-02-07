<?php

namespace App\Repositories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface CategoryRepositoryInterface
{
    public function find(int $id): ?Category;
    public function findBySlug(string $slug): ?Category;
    public function getAll(array $filters = [], int $perPage = 20): LengthAwarePaginator;
    public function getTree(): Collection;
    public function create(array $data): Category;
    public function update(Category $category, array $data): Category;
    public function delete(Category $category): bool;
}
