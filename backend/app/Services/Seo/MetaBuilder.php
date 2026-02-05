<?php

namespace App\Services\Seo;

use Illuminate\Support\Str;

class MetaBuilder
{
    /**
     * Build meta data array for a given model/type.
     *
     * @param string $type
     * @param mixed $model
     * @return array
     */
    public static function build(string $type, $model = null): array
    {
        $meta = [
            'title' => config('app.name') . ' - Premium Supplements',
            'description' => 'Discover the best supplements for your health and fitness journey.',
            'image' => asset('logo.png'), // Should be replaced with actual default OG
            'type' => 'website',
            'canonical' => url('/'),
        ];

        if ($type === 'product' && $model) {
            $meta['title'] = $model->name . ' | ' . config('app.name');
            $meta['description'] = Str::limit(strip_tags($model->description), 160);
            $meta['canonical'] = url('/product/' . $model->slug);
            $meta['type'] = 'product';
            
            // Assume the model has an 'image_url' accessor or attribute
            // If the model uses a relation for images, handle specifically, 
            // but keep it simple as per spec to not over-engineer.
            // Using logic observed in previous MetaController.
            if (isset($model->image_url)) {
                 $meta['image'] = $model->image_url;
            } elseif (method_exists($model, 'images') && $model->images->count() > 0) {
                 $meta['image'] = $model->images->first()->url;
            }
        }

        return $meta;
    }
}
