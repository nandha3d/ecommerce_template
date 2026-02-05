<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
$app->instance('request', \Illuminate\Http\Request::capture());

try {
    echo "Attempting to fetch product ID 1...\n";
    $product = \Core\Product\Models\Product::with([
            'brand',
            'categories',
            'images',
            'variants',
            'addonGroups.options',
        ])->find(1);

    if ($product) {
        echo "Product Found: " . $product->name . "\n";
        echo "Variants: " . $product->variants->count() . "\n";
        echo "AddonGroups: " . $product->addonGroups->count() . "\n";
        echo "Attributes: " . json_encode($product->variants->first()?->attributes) . "\n";
    } else {
        echo "Product ID 1 not found.\n";
        // Try getting any product
        $p = \Core\Product\Models\Product::first();
        if ($p) {
             echo "Found another product ID: " . $p->id . "\n";
        } else {
             echo "No products in database.\n";
        }
    }
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    echo $e->getTraceAsString();
}
