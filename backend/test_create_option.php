<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
$app->instance('request', \Illuminate\Http\Request::capture());

try {
    echo "Attempting to add option 'Small' to Attribute ID 1 (Size)...\n";
    $attr = \App\Models\ProductAttribute::find(1);
    if (!$attr) {
        die("Attribute ID 1 not found.\n");
    }

    echo "Attribute found: " . $attr->name . "\n";

    $option = \App\Models\ProductAttributeOption::create([
        'attribute_id' => $attr->id,
        'value' => 'Small',
        'label' => 'Small',
        'sort_order' => 0
    ]);

    echo "Option created with ID: " . $option->id . "\n";
    
    $check = \App\Models\ProductAttributeOption::find($option->id);
    echo "Verified Option: " . $check->value . "\n";

} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
