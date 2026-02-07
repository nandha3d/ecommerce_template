<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use Core\Product\Models\Product;
use App\Models\Category;

class ProductFilter extends Component
{
    use WithPagination;
    
    public $search = '';
    public $category = '';
    public $minPrice = 0;
    public $maxPrice = 100000; // Increased to show all products by default
    public $sortBy = 'name';
    public $categories = []; // Preload categories
    
    protected $queryString = [
        'search' => ['except' => ''],
        'category' => ['except' => ''],
        'sortBy' => ['except' => 'name'],
    ];
    
    public function mount()
    {
        // Load categories for the dropdown
        $this->categories = Category::whereNull('parent_id')->orderBy('name')->get();
    }
    
    public function updatingSearch()
    {
        $this->resetPage();
    }
    
    public function render()
    {
        $products = Product::query()
            ->active()
            ->when($this->search, function($query) {
                $query->search($this->search);
            })
            ->when($this->category, function($query) {
                $query->whereHas('categories', function($q) {
                    $q->where('slug', $this->category);
                });
            })
            ->whereBetween('price', [$this->minPrice, $this->maxPrice]);
            
        // Sorting logic
        switch ($this->sortBy) {
            case 'price':
                $products->orderBy('price', 'asc');
                break;
            case '-price':
                $products->orderBy('price', 'desc');
                break;
            case 'average_rating':
                $products->orderBy('average_rating', 'desc');
                break;
            case 'newest':
                $products->orderBy('created_at', 'desc');
                break;
            case 'name':
            default:
                $products->orderBy('name', 'asc');
                break;
        }

        return view('livewire.product-filter', [
            'products' => $products->paginate(12)
        ]);
    }
}
