<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
$app->instance('request', \Illuminate\Http\Request::capture());

try {
    echo "Fetching Attributes...\n";
    $attributes = \App\Models\ProductAttribute::with('options')->get();

    echo "Found " . $attributes->count() . " attributes.\n";

    foreach ($attributes as $attr) {
        echo "Attribute: {$attr->name} (ID: {$attr->id})\n";
        echo "Options Count: " . $attr->options->count() . "\n";
        foreach ($attr->options as $opt) {
            echo " - Option: {$opt->value} (ID: {$opt->id})\n";
        }
        echo "------------------\n";
    }

} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
