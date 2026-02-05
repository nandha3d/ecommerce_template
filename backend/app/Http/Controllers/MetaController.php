<?php

namespace App\Http\Controllers;

use Core\Product\Models\Product;
use App\Services\Seo\SeoRenderer;
use Illuminate\Http\Response;

class MetaController extends Controller
{
    /**
     * Handle home page SEO.
     */
    public function home(SeoRenderer $seo): Response
    {
        return $seo->render('home');
    }

    /**
     * Handle product page SEO.
     */
    public function product($slug, SeoRenderer $seo): Response
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        return $seo->render('product', $product);
    }

    /**
     * Fallback for other pages.
     */
    public function default(SeoRenderer $seo): Response
    {
        return $seo->render('default');
    }
}
