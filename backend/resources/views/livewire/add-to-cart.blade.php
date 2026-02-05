<div class="space-y-6">
    <!-- Variants Selection -->
    @if($product->variants && $product->variants->count() > 0)
    <div>
        <label class="block font-semibold mb-2 text-gray-700">Select Option:</label>
        <div class="flex flex-wrap gap-2">
            @foreach($product->variants as $variant)
            <button 
                wire:click="$set('selectedVariant', {{ $variant->id }})"
                class="px-4 py-2 border rounded-lg transition-colors {{ $selectedVariant == $variant->id ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300' }}">
                {{ $variant->name }}
            </button>
            @endforeach
        </div>
        @error('selectedVariant') <span class="text-red-500 text-sm mt-1">Please select an option.</span> @enderror
    </div>
    @endif
    
    <!-- Quantity and Add Button -->
    <div class="flex items-end gap-4">
        <!-- Quantity -->
        <div>
            <label class="block font-bold mb-2 text-gray-700 text-sm uppercase tracking-wide">Quantity</label>
            <div class="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                <button 
                    wire:click="decrement"
                    class="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-l-xl transition text-gray-600 hover:text-blue-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                </button>
                <span class="w-12 text-center text-lg font-bold text-gray-900">{{ $quantity }}</span>
                <button 
                    wire:click="increment"
                    class="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-r-xl transition text-gray-600 hover:text-blue-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>
        </div>

        <!-- Add Button -->
        <button 
            wire:click="addToCart"
            class="flex-1 bg-blue-600 text-white h-12 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group">
            <svg class="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Add to Cart - ${{ number_format($product->current_price * $quantity, 2) }}
        </button>
    </div>
    
    <!-- Success Message -->
    @if (session()->has('message'))
        <div 
            x-data="{ show: true }" 
            x-init="setTimeout(() => show = false, 3000)" 
            x-show="show"
            x-transition:enter="transition ease-out duration-300"
            x-transition:enter-start="opacity-0 transform translate-y-2"
            x-transition:enter-end="opacity-100 transform translate-y-0"
            x-transition:leave="transition ease-in duration-200"
            x-transition:leave-start="opacity-100 transform translate-y-0"
            x-transition:leave-end="opacity-0 transform translate-y-2"
            class="fixed bottom-4 right-4 z-50 bg-gray-900/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-800">
            <div class="bg-green-500 rounded-full p-1">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="font-medium">{{ session('message') }}</span>
        </div>
    @endif
</div>
