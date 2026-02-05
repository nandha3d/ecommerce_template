@extends('layouts.app')

@section('title', $product->seo_title ?? $product->name . ' - ' . config('app.name'))
@section('description', $product->seo_description ?? Str::limit($product->short_description, 160))
@section('image', $product->primaryImage ? $product->primaryImage->image_path : ($product->images->first()->image_path ?? asset('images/og-default.jpg')))

@section('schema')
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{{ $product->name }}",
  "description": "{{ $product->seo_description ?? Str::limit(strip_tags($product->description), 160) }}",
  "image": [
    @foreach($product->images as $image)
    "{{ $image->image_path }}"{{ !$loop->last ? ',' : '' }}
    @endforeach
  ],
  "brand": {
    "@type": "Brand",
    "name": "{{ $product->brand ? $product->brand->name : config('app.name') }}"
  },
  "offers": {
    "@type": "Offer",
    "url": "{{ route('products.show', $product->slug) }}",
    "priceCurrency": "USD",
    "price": "{{ $product->current_price }}",
    "availability": "{{ $product->is_in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }}"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{ $product->average_rating }}",
    "reviewCount": "{{ $product->review_count }}"
  }
}
</script>
@endsection

@section('content')
@section('content')
<div class="bg-white">
    <div class="container mx-auto px-4 py-8">
        <!-- Breadcrumbs -->
        <nav class="flex mb-8 text-sm font-medium">
            <a href="/" class="text-gray-500 hover:text-blue-600 transition-colors">Home</a>
            <span class="mx-3 text-gray-300">/</span>
            <a href="{{ route('products.index') }}" class="text-gray-500 hover:text-blue-600 transition-colors">Shop</a>
            <span class="mx-3 text-gray-300">/</span>
            <span class="text-gray-900 line-clamp-1 max-w-[200px]">{{ $product->name }}</span>
        </nav>

        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            <!-- Product Images (Alpine.js Gallery) -->
            <div x-data="{ selected: '{{ $product->primaryImage ? $product->primaryImage->image_path : ($product->images->first()->image_path ?? '') }}' }" class="space-y-6">
                <!-- Main Image -->
                <div class="aspect-[4/4] bg-gray-50 rounded-3xl overflow-hidden relative group shadow-sm border border-gray-100">
                    <template x-if="selected">
                        <img :src="selected" alt="{{ $product->name }}" class="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-700 ease-in-out">
                    </template>
                    <template x-if="!selected">
                        <div class="flex items-center justify-center h-full text-gray-400">
                            <svg class="w-20 h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                    </template>
                    
                    @if($product->sale_price)
                        <div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold shadow-lg text-sm">
                            SAVE {{ $product->discount_percentage }}%
                        </div>
                    @endif
                </div>
                
                <!-- Thumbnails -->
                @if($product->images->count() > 1)
                <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    @foreach($product->images as $image)
                    <button 
                        @click="selected = '{{ $image->image_path }}'"
                        :class="selected === '{{ $image->image_path }}' ? 'ring-2 ring-blue-600 ring-offset-2 opacity-100' : 'opacity-70 hover:opacity-100 hover:ring-2 hover:ring-gray-300 ring-offset-1'"
                        class="relative flex-none w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 transition-all duration-200 border border-gray-100">
                        <img src="{{ $image->image_path }}" class="w-full h-full object-cover" alt="Thumbnail">
                    </button>
                    @endforeach
                </div>
                @endif
            </div>
            
            <!-- Product Info -->
            <div class="lg:sticky lg:top-24 h-fit">
                <div class="mb-4">
                     @if($product->brand)
                        <a href="{{ route('products.index', ['brand' => $product->brand->slug]) }}" class="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm uppercase tracking-wider hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full transition-colors">
                            {{ $product->brand->name }}
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </a>
                    @endif
                </div>
                
                <div class="flex justify-between items-start mb-4">
                    <h1 class="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">{{ $product->name }}</h1>
                    <div class="mt-2 ml-4">
                        @livewire('wishlist-button', ['productId' => $product->id])
                    </div>
                </div>
                
                <!-- Rating -->
                <div class="flex items-center gap-4 mb-8">
                    <div class="flex items-center gap-1">
                        <div class="flex text-yellow-400">
                            @for($i = 1; $i <= 5; $i++)
                                <svg class="w-5 h-5 {{ $i <= round($product->average_rating) ? 'fill-current' : 'text-gray-200 fill-current' }}" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                            @endfor
                        </div>
                        <span class="font-bold text-gray-900 ml-2">{{ number_format($product->average_rating, 1) }}</span>
                    </div>
                    <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span class="text-sm font-medium text-gray-500 hover:text-blue-600 cursor-pointer transition-colors">{{ $product->review_count }} Reviews</span>
                </div>
                
                <!-- Price -->
                <div class="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                    <div class="flex items-end gap-3 mb-2">
                         @if($product->sale_price)
                            <span class="text-5xl font-black text-gray-900 tracking-tight">${{ number_format($product->sale_price, 2) }}</span>
                            <span class="text-xl text-gray-400 line-through font-medium mb-2">${{ number_format($product->price, 2) }}</span>
                        @else
                            <span class="text-5xl font-black text-gray-900 tracking-tight">${{ number_format($product->price, 2) }}</span>
                        @endif
                    </div>

                    @if(!$product->is_in_stock)
                        <div class="inline-flex items-center gap-2 text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Temporarily Out of Stock
                        </div>
                    @else
                        <div class="inline-flex items-center gap-2 text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            In Stock & Ready to Ship
                        </div>
                    @endif
                </div>
                
                <!-- Short Description -->
                <div class="prose prose-lg text-gray-600 mb-8 leading-relaxed">
                    <p>{{ $product->short_description }}</p>
                </div>
                
                <!-- Livewire Add to Cart -->
                <div class="mb-8">
                    @livewire('add-to-cart', ['productId' => $product->id])
                </div>
                
                <!-- Benefits -->
                @if($product->benefits && count($product->benefits) > 0)
                <div class="border-t border-gray-100 pt-8">
                    <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Why You'll Love It
                    </h3>
                    <ul class="grid grid-cols-1 gap-3">
                        @foreach($product->benefits as $benefit)
                        <li class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span class="text-gray-700 font-medium">{{ $benefit }}</span>
                        </li>
                        @endforeach
                    </ul>
                </div>
                @endif
            </div>
        </div>
        
        <!-- Tabs Section -->
        <div class="mt-20 border-t border-gray-100 pt-16" x-data="{ tab: 'description' }">
            <div class="flex flex-col md:flex-row gap-8">
                <!-- Tab Headers -->
                <div class="flex md:flex-col gap-2 md:w-64 flex-shrink-0 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
                    <button @click="tab = 'description'" :class="tab === 'description' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'" class="px-6 py-4 rounded-xl font-bold text-left transition-all duration-300 w-full whitespace-nowrap md:whitespace-normal">Description</button>
                    <button @click="tab = 'ingredients'" :class="tab === 'ingredients' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'" class="px-6 py-4 rounded-xl font-bold text-left transition-all duration-300 w-full whitespace-nowrap md:whitespace-normal">Ingredients</button>
                    <button @click="tab = 'reviews'" :class="tab === 'reviews' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'" class="px-6 py-4 rounded-xl font-bold text-left transition-all duration-300 w-full whitespace-nowrap md:whitespace-normal">
                        Reviews 
                        <span :class="tab === 'reviews' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'" class="ml-2 text-xs px-2 py-0.5 rounded-full">{{ $product->review_count }}</span>
                    </button>
                </div>
                
                <!-- Tab Content -->
                <div class="flex-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px]">
                    <!-- Description Tab -->
                    <div x-show="tab === 'description'" x-cloak class="prose prose-lg max-w-none prose-blue">
                        {!! $product->description !!}
                    </div>
                    
                    <!-- Ingredients Tab -->
                    <div x-show="tab === 'ingredients'" x-cloak class="prose prose-lg max-w-none prose-blue">
                        @if($product->ingredients)
                            <h3 class="font-bold text-2xl mb-6">Supplement Facts & Ingredients</h3>
                            
                            @if(is_array($product->ingredients))
                                <div class="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                    <ul class="grid md:grid-cols-2 gap-4 m-0 p-0 text-base list-none">
                                    @foreach($product->ingredients as $ing)
                                        <li class="flex items-center gap-3 p-0 m-0">
                                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            <span>{{ $ing }}</span>
                                        </li>
                                    @endforeach
                                    </ul>
                                </div>
                            @else
                                <p class="mb-8 text-gray-600">{{ $product->ingredients }}</p>
                            @endif
                            
                            @if($product->nutrition_facts)
                            <div class="border rounded-2xl overflow-hidden shadow-sm">
                                <div class="bg-gray-50 px-6 py-4 border-b font-bold text-lg">Nutrition Information</div>
                                <div class="overflow-x-auto">
                                    <table class="min-w-full text-left text-sm whitespace-nowrap m-0">
                                        <thead class="bg-white text-gray-500 border-b">
                                            <tr>
                                                <th class="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Nutrient</th>
                                                <th class="px-6 py-3 font-semibold uppercase tracking-wider text-xs text-right">Amount per serving</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-100 bg-white">
                                            @foreach($product->nutrition_facts as $key => $val)
                                            <tr class="hover:bg-gray-50 transition-colors">
                                                <td class="px-6 py-4 font-medium text-gray-900">{{ $key }}</td>
                                                <td class="px-6 py-4 text-gray-600 text-right font-mono">{{ $val }}</td>
                                            </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            @endif
                        @else
                           <div class="text-center py-12">
                               <p class="text-gray-500 italic">No specific ingredients listed for this product.</p>
                           </div>
                        @endif
                    </div>
                    
                    <!-- Reviews Tab -->
                    <div x-show="tab === 'reviews'" x-cloak>
                        <div class="space-y-8">
                            <div class="flex items-center justify-between mb-8">
                                <div>
                                    <h3 class="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                                    <p class="text-gray-500">Based on {{ $product->review_count }} reviews</p>
                                </div>
                                <button class="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-900/10">Write a Review</button>
                            </div>

                            @forelse($product->reviews as $review)
                            <div class="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                            {{ substr($review->user ? $review->user->name : 'A', 0, 1) }}
                                        </div>
                                        <div>
                                            <div class="font-bold text-gray-900">{{ $review->user ? $review->user->name : 'Anonymous' }}</div>
                                            <div class="text-xs text-gray-400">{{ $review->created_at->format('F d, Y') }}</div>
                                        </div>
                                    </div>
                                    <div class="flex text-yellow-400">
                                        @for($i = 1; $i <= 5; $i++)
                                            <svg class="w-4 h-4 {{ $i <= $review->rating ? 'fill-current' : 'text-gray-200 fill-current' }}" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                        @endfor
                                    </div>
                                </div>
                                
                                <div class="pl-13 ml-13">
                                    <h4 class="font-bold text-gray-900 mb-2">{{ $review->title }}</h4>
                                    <p class="text-gray-600 leading-relaxed">{{ $review->comment }}</p>
                                    
                                     @if($review->is_verified_purchase)
                                        <div class="mt-4 inline-flex items-center gap-1.5 text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Verified Purchase
                                        </div>
                                    @endif
                                </div>
                            </div>
                            @empty
                            <div class="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                                <h3 class="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
                                <p class="text-gray-500">Be the first to share your thoughts on this product.</p>
                            </div>
                            @endforelse
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Related Products -->
        @if($relatedProducts->count() > 0)
        <div class="mt-24 border-t border-gray-100 pt-16">
            <h2 class="text-3xl font-bold mb-8 text-center">You May Also Like</h2>
            <div class="grid md:grid-cols-4 gap-8">
                @foreach($relatedProducts as $related)
                    @include('components.product-card', ['product' => $related])
                @endforeach
            </div>
        </div>
        @endif
    </div>
</div>
@endsection
