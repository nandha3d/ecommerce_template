<div>
    <div class="grid lg:grid-cols-4 gap-8">
        <!-- Sidebar Filters -->
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-bold text-lg mb-4">Filters</h3>
                
                <!-- Search -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input 
                        wire:model.live.debounce.300ms="search"
                        type="text" 
                        placeholder="Search products..."
                        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <!-- Category -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select wire:model.live="category" class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All Categories</option>
                        @foreach($categories as $cat)
                            <option value="{{ $cat->slug }}">{{ $cat->name }}</option>
                        @endforeach
                    </select>
                </div>
                
                <!-- Price Range -->
                <div x-data="{ min: @entangle('minPrice'), max: @entangle('maxPrice') }" class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Price: $<span x-text="min"></span> - $<span x-text="max"></span>
                    </label>
                    <div class="flex flex-col gap-4">
                        <input type="range" x-model="min" min="0" max="5000" step="100" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                        <input type="range" x-model="max" min="0" max="10000" step="100" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    </div>
                </div>

                <!-- Sort -->
                <div>
                     <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select wire:model.live="sortBy" class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
                        <option value="name">Name (A-Z)</option>
                        <option value="newest">Newest</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="average_rating">Rating</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Product Grid -->
        <div class="lg:col-span-3">
             <!-- Loading State -->
            <div wire:loading class="w-full text-center py-4">
                <span class="inline-flex items-center text-blue-600">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading products...
                </span>
            </div>

            <div class="grid md:grid-cols-3 gap-6" wire:loading.class="opacity-50">
                @forelse($products as $product)
                    @include('components.product-card', ['product' => $product])
                @empty
                    <div class="col-span-3 text-center py-12 bg-white rounded-lg">
                        <p class="text-gray-500">No products found matching your criteria.</p>
                    </div>
                @endforelse
            </div>
            
            <!-- Pagination -->
            <div class="mt-8">
                {{ $products->links() }}
            </div>
        </div>
    </div>
</div>
