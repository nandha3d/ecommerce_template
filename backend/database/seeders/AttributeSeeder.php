<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeOption;
use Illuminate\Support\Str;

class AttributeSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            [
                'name' => 'Size',
                'type' => 'text',
                'options' => [
                    ['value' => 'XS', 'label' => 'Extra Small'],
                    ['value' => 'S', 'label' => 'Small'],
                    ['value' => 'M', 'label' => 'Medium'],
                    ['value' => 'L', 'label' => 'Large'],
                    ['value' => 'XL', 'label' => 'Extra Large'],
                    ['value' => 'XXL', 'label' => '2X Large'],
                ],
            ],
            [
                'name' => 'Flavor',
                'type' => 'text',
                'options' => [
                    ['value' => 'chocolate', 'label' => 'Chocolate'],
                    ['value' => 'vanilla', 'label' => 'Vanilla'],
                    ['value' => 'strawberry', 'label' => 'Strawberry'],
                    ['value' => 'cookies-cream', 'label' => 'Cookies & Cream'],
                    ['value' => 'peanut-butter', 'label' => 'Peanut Butter'],
                    ['value' => 'banana', 'label' => 'Banana'],
                ],
            ],
            [
                'name' => 'Color',
                'type' => 'color',
                'options' => [
                    ['value' => 'red', 'label' => 'Red', 'color_code' => '#EF4444'],
                    ['value' => 'blue', 'label' => 'Blue', 'color_code' => '#3B82F6'],
                    ['value' => 'green', 'label' => 'Green', 'color_code' => '#22C55E'],
                    ['value' => 'black', 'label' => 'Black', 'color_code' => '#1F2937'],
                    ['value' => 'white', 'label' => 'White', 'color_code' => '#F9FAFB'],
                    ['value' => 'purple', 'label' => 'Purple', 'color_code' => '#8B5CF6'],
                    ['value' => 'orange', 'label' => 'Orange', 'color_code' => '#F97316'],
                    ['value' => 'pink', 'label' => 'Pink', 'color_code' => '#EC4899'],
                ],
            ],
            [
                'name' => 'Weight',
                'type' => 'text',
                'options' => [
                    ['value' => '1lb', 'label' => '1 lb'],
                    ['value' => '2lb', 'label' => '2 lb'],
                    ['value' => '5lb', 'label' => '5 lb'],
                    ['value' => '10lb', 'label' => '10 lb'],
                ],
            ],
            [
                'name' => 'Pattern',
                'type' => 'image',
                'options' => [
                    ['value' => 'solid', 'label' => 'Solid'],
                    ['value' => 'camo', 'label' => 'Camouflage'],
                    ['value' => 'striped', 'label' => 'Striped'],
                ],
            ],
        ];

        foreach ($attributes as $attrData) {
            $attribute = ProductAttribute::updateOrCreate(
                ['slug' => Str::slug($attrData['name'])],
                [
                    'name' => $attrData['name'],
                    'type' => $attrData['type'],
                    'is_active' => true,
                    'sort_order' => 0,
                ]
            );

            // Add options
            foreach ($attrData['options'] as $index => $optData) {
                ProductAttributeOption::updateOrCreate(
                    [
                        'attribute_id' => $attribute->id,
                        'value' => $optData['value'],
                    ],
                    [
                        'label' => $optData['label'],
                        'color_code' => $optData['color_code'] ?? null,
                        'image' => $optData['image'] ?? null,
                        'sort_order' => $index,
                    ]
                );
            }
        }

        $this->command->info('Attributes and options seeded successfully!');
    }
}
