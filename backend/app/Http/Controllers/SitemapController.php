<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index()
    {
        $products = Product::all();
        $baseUrl = url('/');

        $content = '<?xml version="1.0" encoding="UTF-8"?>';
        $content .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Static Pages
        $content .= '
        <url>
            <loc>' . $baseUrl . '</loc>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>';

        foreach ($products as $product) {
            // Assuming we will implement slug soon, using ID as temporary fallback if slug missing
            // But implementing for future-proof slug usage
            $slug = $product->slug ?? $product->id;
            
            $content .= '
            <url>
                <loc>' . $baseUrl . '/product/' . $slug . '</loc>
                <lastmod>' . $product->updated_at->toAtomString() . '</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>';
        }

        $content .= '</urlset>';

        return response($content, 200, [
            'Content-Type' => 'application/xml'
        ]);
    }
}
