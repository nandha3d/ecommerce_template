<?php

namespace App\Http\Controllers;

use Core\Product\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Reuse logic from API controller but for blade views
        $query = Product::with(['brand', 'categories', 'images']);
        
        $query->active();

        if ($search = $request->input('search')) {
            $query->search($search);
        }

        if ($category = $request->input('category')) {
            $query->whereHas('categories', function ($q) use ($category) {
                $q->where('slug', $category);
            });
        }
        
        // Additional filters can be handled by Livewire component calling this or independent
        // For the main verified page load, we support basic params.
        
        $products = $query->paginate(12);
        
        return view('products.index', compact('products'));
    }

    public function show(string $slug)
    {
        $product = Product::with([
            'brand', 
            'categories', 
            'images', 
            'variants',
            'reviews.user' => function ($q) {
                $q->latest()->limit(10);
            }
        ])
        ->where('slug', $slug)
        ->active()
        ->firstOrFail();

        // Get Related Products
        $categoryIds = $product->categories->pluck('id');
        $relatedProducts = Product::with(['brand', 'images'])
            ->where('id', '!=', $product->id)
            ->active()
            ->whereHas('categories', function ($q) use ($categoryIds) {
                $q->whereIn('categories.id', $categoryIds);
            })
            ->limit(4)
            ->get();

        return view('products.show', compact('product', 'relatedProducts'));
    }
}
