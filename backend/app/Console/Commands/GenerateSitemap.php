<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Core\Product\Models\Product;
use App\Models\Category;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';
    protected $description = 'Generate XML sitemap for SEO';

    public function handle()
    {
        $this->info('Generating sitemap...');
        
        $sitemapArr = [];
        $sitemapArr[] = '<?xml version="1.0" encoding="UTF-8"?>';
        $sitemapArr[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        
        // Homepage
        $sitemapArr[] = $this->addUrl(config('app.url'), now(), 'daily', '1.0');
        
        // Static pages
        $staticPages = [
            '/about' => 'monthly',
            '/contact' => 'monthly',
            '/privacy-policy' => 'monthly',
            '/terms-of-service' => 'monthly',
        ];
        
        foreach ($staticPages as $page => $freq) {
            $sitemapArr[] = $this->addUrl(config('app.url') . $page, now(), $freq, '0.5');
        }
        
        // Products
        $products = Product::where('is_active', true)->get();
        $this->info("Adding {$products->count()} products...");
        
        foreach ($products as $product) {
            $url = config('app.url') . '/products/' . $product->slug;
            $sitemapArr[] = $this->addUrl($url, $product->updated_at ?? now(), 'weekly', '0.8');
        }
        
        // Categories
        $categories = Category::all();
        $this->info("Adding {$categories->count()} categories...");
        
        foreach ($categories as $category) {
            $url = config('app.url') . '/categories/' . $category->slug;
            $sitemapArr[] = $this->addUrl($url, $category->updated_at ?? now(), 'weekly', '0.7');
        }
        
        $sitemapArr[] = '</urlset>';
        
        // Save to public directory
        $path = public_path('sitemap.xml');
        file_put_contents($path, implode("\n", $sitemapArr));
        
        $this->info("✓ Sitemap generated successfully at {$path}");
        
        return 0;
    }
    
    private function addUrl(string $loc, $lastmod, string $changefreq, string $priority): string
    {
        return sprintf(
            '  <url><loc>%s</loc><lastmod>%s</lastmod><changefreq>%s</changefreq><priority>%s</priority></url>',
            htmlspecialchars($loc),
            $lastmod->toAtomString(),
            $changefreq,
            $priority
        );
    }
}
