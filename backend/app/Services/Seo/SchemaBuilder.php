<?php

namespace App\Services\Seo;

use Illuminate\Support\Str;

class SchemaBuilder
{
    /**
     * Build JSON-LD array for a given model/type.
     *
     * @param string $type
     * @param mixed $model
     * @return array|null
     */
    public static function build(string $type, $model = null): ?array
    {
        if ($type === 'product' && $model) {
            $schema = [
                '@context' => 'https://schema.org/',
                '@type' => 'Product',
                'name' => $model->name,
                'description' => Str::limit(strip_tags($model->description), 160),
                'sku' => $model->sku ?? '',
                'brand' => [
                    '@type' => 'Brand',
                    'name' => $model->brand->name ?? 'SupplePro',
                ],
            ];

            // Handle Price/Offers
            if (isset($model->price)) {
                $schema['offers'] = [
                    '@type' => 'Offer',
                    'url' => url('/product/' . $model->slug),
                    'priceCurrency' => 'USD',
                    'price' => $model->price,
                    'itemCondition' => 'https://schema.org/NewCondition',
                    'availability' => ($model->stock_quantity > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                ];
            }

            // Handle Images
            if (isset($model->image_url)) {
                $schema['image'] = [$model->image_url];
            } elseif (method_exists($model, 'images') && $model->images->count() > 0) {
                 $schema['image'] = [$model->images->first()->url];
            }

            return $schema;
        }

        // Default Organization Schema for Home
        if ($type === 'home') {
            return [
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => 'SupplePro',
                'url' => url('/'),
                'logo' => asset('logo.png'),
                'contactPoint' => [
                    '@type' => 'ContactPoint',
                    'telephone' => '+1-555-555-5555',
                    'contactType' => 'Customer Service',
                ],
            ];
        }

        return null;
    }
}
