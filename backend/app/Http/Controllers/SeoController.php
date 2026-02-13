<?php

namespace App\Http\Controllers;

use Core\Product\Models\Product;
use Illuminate\Http\Request;

class SeoController extends Controller
{
    public function product($slug)
    {
        $product = Product::with(['defaultVariant', 'brand', 'categories'])
            ->where('slug', $slug)
            ->firstOrFail();

        return view('seo.product', compact('product'));
    }
}
