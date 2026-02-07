@extends('layouts.app')

@section('title', 'Shopping Cart - ' . config('app.name'))

@section('content')
<div class="bg-gray-50 py-12 min-h-screen">
    <div class="container mx-auto px-4">
        <h1 class="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Your Shopping Cart</h1>
        
        @if(count($cartItems) > 0)
        <div class="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <!-- Cart Items -->
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th class="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Description</th>
                                    <th class="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th class="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th class="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @foreach($cartItems as $item)
                                <tr class="group hover:bg-gray-50/50 transition-colors">
                                    <td class="px-8 py-6">
                                        <div class="flex items-center gap-6">
                                            <div class="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                                @if($item->product->primaryImage)
                                                    <img class="h-full w-full object-cover transform group-hover:scale-105 transition duration-500" src="{{ $item->product->primaryImage->image_path }}" alt="">
                                                @else
                                                    <div class="h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                                @endif
                                            </div>
                                            <div>
                                                <h3 class="font-bold text-gray-900 text-lg mb-1">
                                                    <a href="{{ route('products.show', $item->product->slug) }}" class="hover:text-blue-600 transition-colors">
                                                        {{ $item->product->name }}
                                                    </a>
                                                </h3>
                                                @if($item->variant)
                                                    <div class="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block">{{ $item->variant->name }}</div>
                                                @endif
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-6 text-gray-600 font-medium whitespace-nowrap">
                                        ${{ number_format($item->unit_price, 2) }}
                                    </td>
                                    <td class="px-6 py-6 text-center whitespace-nowrap">
                                        <div class="inline-flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                                            <button class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-lg transition">-</button>
                                            <span class="w-8 flex items-center justify-center font-bold text-gray-900 text-sm">{{ $item->quantity }}</span>
                                            <button class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-lg transition">+</button>
                                        </div>
                                    </td>
                                    <td class="px-8 py-6 text-right font-bold text-gray-900 whitespace-nowrap text-lg">
                                        ${{ number_format($item->unit_price * $item->quantity, 2) }}
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="flex justify-between items-center px-2">
                    <a href="{{ route('products.index') }}" class="group flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors">
                        <svg class="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Continue Shopping
                    </a>
                </div>
            </div>
            
            <!-- Summary -->
            <div class="lg:col-span-1">
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:sticky lg:top-24">
                    <h2 class="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>
                    <div class="space-y-4 mb-8">
                        <div class="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span class="font-medium">${{ number_format($subtotal, 2) }}</span>
                        </div>
                        <div class="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span class="text-green-600 font-medium text-sm">Calculated at checkout</span>
                        </div>
                        <div class="flex justify-between text-gray-600">
                            <span>Tax Estimate</span>
                            <span class="font-medium">$0.00</span>
                        </div>
                        <div class="border-t border-gray-100 pt-4 flex justify-between items-end">
                            <span class="font-bold text-gray-900 text-lg">Total</span>
                            <div class="text-right">
                                <span class="block text-2xl font-black text-gray-900">${{ number_format($subtotal, 2) }}</span>
                                <span class="text-xs text-gray-400">USD</span>
                            </div>
                        </div>
                    </div>
                    
                    <button class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5 mb-4">
                        Proceed to Checkout
                    </button>
                    
                    <div class="flex items-center justify-center gap-2 text-gray-400 opacity-60">
                        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M..."></path></svg> 
                        <!-- Placeholder for payment icons -->
                        <span class="text-xs">Secure Encrypted Payment</span>
                    </div>
                </div>
            </div>
        </div>
        @else
        <div class="bg-white p-20 rounded-3xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
            <div class="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p class="text-gray-500 mb-8 text-lg">Looks like you haven't discovered our premium supplements yet.</p>
            <a href="{{ route('products.index') }}" class="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 hover:-translate-y-1">
                Start Shopping
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
        </div>
        @endif
    </div>
</div>
@endsection
