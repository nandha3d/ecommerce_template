<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeOption;
use Illuminate\Support\Str;

class AttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Size Attribute
        $sizeAttr = ProductAttribute::updateOrCreate(
            ['slug' => 'size'],
            [
                'name' => 'Size',
                'type' => 'text',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        foreach (['XS', 'S', 'M', 'L', 'XL', 'XXL'] as $index => $size) {
            ProductAttributeOption::updateOrCreate(
                ['attribute_id' => $sizeAttr->id, 'value' => strtolower($size)],
                [
                    'label' => $size,
                    'sort_order' => $index,
                ]
            );
        }

        // 2. Color Attribute
        $colorAttr = ProductAttribute::updateOrCreate(
            ['slug' => 'color'],
            [
                'name' => 'Color',
                'type' => 'color',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $colors = [
            ['value' => 'black', 'label' => 'Black', 'color_code' => '#000000'],
            ['value' => 'white', 'label' => 'White', 'color_code' => '#FFFFFF'],
            ['value' => 'red', 'label' => 'Red', 'color_code' => '#FF0000'],
            ['value' => 'blue', 'label' => 'Blue', 'color_code' => '#0000FF'],
            ['value' => 'green', 'label' => 'Green', 'color_code' => '#00FF00'],
        ];

        foreach ($colors as $index => $color) {
            ProductAttributeOption::updateOrCreate(
                ['attribute_id' => $colorAttr->id, 'value' => $color['value']],
                [
                    'label' => $color['label'],
                    'color_code' => $color['color_code'],
                    'sort_order' => $index,
                ]
            );
        }

        // 3. Weight Attribute (Common for Supplements)
        $weightAttr = ProductAttribute::updateOrCreate(
            ['slug' => 'weight'],
            [
                'name' => 'Weight',
                'type' => 'text',
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

        $weights = ['500g', '1kg', '2kg', '5kg'];
        foreach ($weights as $index => $weight) {
            ProductAttributeOption::updateOrCreate(
                ['attribute_id' => $weightAttr->id, 'value' => strtolower($weight)],
                [
                    'label' => $weight,
                    'sort_order' => $index,
                ]
            );
        }
    }
}
