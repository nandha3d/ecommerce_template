<?php

namespace App\Http\Controllers;

use Core\Product\Models\Product;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        // Fetch data for the homepage
        $featuredProducts = Product::with(['brand', 'categories', 'images'])
            ->featured()
            ->limit(8)
            ->get();
            
        $bestSellers = Product::with(['brand', 'categories', 'images'])
            ->bestSellers()
            ->orderBy('review_count', 'desc')
            ->limit(8)
            ->get();
            
        $newArrivals = Product::with(['brand', 'categories', 'images'])
            ->new()
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        return view('home', compact('featuredProducts', 'bestSellers', 'newArrivals'));
    }
}
