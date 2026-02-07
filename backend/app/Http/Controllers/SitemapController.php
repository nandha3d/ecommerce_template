<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate XML sitemap for SEO
     */
    public function index(): Response
    {
        $products = Product::where('is_active', true)
            ->orderBy('updated_at', 'desc')
            ->get(['slug', 'updated_at']);

        $categories = Category::where('is_active', true)
            ->orderBy('updated_at', 'desc')
            ->get(['slug', 'updated_at']);

        $baseUrl = url('/');

        $content = '<?xml version="1.0" encoding="UTF-8"?>';
        $content .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Homepage
        $content .= '
        <url>
            <loc>' . $baseUrl . '</loc>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>';

        // Products listing page
        $content .= '
        <url>
            <loc>' . $baseUrl . '/products</loc>
            <changefreq>daily</changefreq>
            <priority>0.9</priority>
        </url>';

        // Category pages
        foreach ($categories as $category) {
            $content .= '
            <url>
                <loc>' . $baseUrl . '/products?category=' . $category->slug . '</loc>
                <lastmod>' . $category->updated_at->toAtomString() . '</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>';
        }

        // Product pages
        foreach ($products as $product) {
            $slug = $product->slug ?? $product->id;
            
            $content .= '
            <url>
                <loc>' . $baseUrl . '/products/' . $slug . '</loc>
                <lastmod>' . $product->updated_at->toAtomString() . '</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>';
        }

        $content .= '</urlset>';

        return response($content, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Generate robots.txt
     */
    public function robots(): Response
    {
        $sitemapUrl = url('/sitemap.xml');
        
        $content = <<<ROBOTS
User-agent: *
Allow: /

# Block admin and API routes
Disallow: /admin
Disallow: /api/
Disallow: /auth/
Disallow: /cart
Disallow: /checkout
Disallow: /installer

# Block search and filter params that create duplicate content
Disallow: /*?*sort=
Disallow: /*?*page=

# Sitemap location
Sitemap: {$sitemapUrl}
ROBOTS;

        return response($content, 200)
            ->header('Content-Type', 'text/plain');
    }
}
