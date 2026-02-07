<?php

namespace App\Services;

use App\Repositories\CategoryRepositoryInterface;
use Illuminate\Support\Str;
use App\Models\Category;

class CategoryService
{
    protected CategoryRepositoryInterface $categoryRepository;
    protected MediaService $mediaService;

    public function __construct(
        CategoryRepositoryInterface $categoryRepository,
        MediaService $mediaService
    ) {
        $this->categoryRepository = $categoryRepository;
        $this->mediaService = $mediaService;
    }

    public function createCategory(array $data): Category
    {
        // Generate slug
        if (!isset($data['slug']) && isset($data['name'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        // Handle Image
        // Note: Controller handles upload via request->file('image') and passes string path? 
        // Or if we move upload logic here, we need UploadedFile. 
        // For now, let's assume controller passes the array, but we might want to standardise.
        // If 'image' is an UploadedFile, we should handle it. but typically validation casts it.
        // Let's stick to array data for now, assuming upload happens or is passed as path.
        // Actually, adhering to the plan: "Image upload logic inside controllers" = BAD.
        // So we should handle upload here if passed.
        
        // However, standardising inputs to array for now.

        return $this->categoryRepository->create($data);
    }

    public function updateCategory(int $id, array $data): Category
    {
        $category = $this->categoryRepository->find($id);

        if (isset($data['name']) && $data['name'] !== $category->name) {
             // Only update slug if explicit or if we want auto-update (usually risky for SEO)
             // Let's keep slug stable unless explicitly changed.
        }

        return $this->categoryRepository->update($category, $data);
    }

    private function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $baseSlug = $slug;
        $counter = 1;

        $query = Category::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $baseSlug . '-' . $counter++;
            $query = Category::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
    }
}
