@extends('layouts.app')

@section('title', 'My Wishlist - ' . config('app.name'))

@section('content')
@section('content')
<div class="bg-gray-50 py-12 min-h-screen">
    <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900">My Wishlist</h1>
            <span class="text-gray-500 font-medium">{{ count($products) }} Items Saved</span>
        </div>
        
        @if(count($products) > 0)
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            @foreach($products as $product)
                @include('components.product-card', ['product' => $product])
            @endforeach
        </div>
        @else
        <div class="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto mt-12">
            <div class="w-24 h-24 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p class="text-gray-500 mb-8 text-lg md:text-xl">Save items you want to see later. They'll be waiting for you here.</p>
            <a href="{{ route('products.index') }}" class="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 hover:-translate-y-1">
                Start Exploring
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
        </div>
        @endif
    </div>
</div>
@endsection
