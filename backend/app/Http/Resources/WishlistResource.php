<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WishlistResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'price' => (float) $this->product->price,
                'sale_price' => $this->product->sale_price ? (float) $this->product->sale_price : null,
                'stock_status' => $this->product->stock_status,
                'images' => $this->product->images->map(fn($img) => [
                    'id' => $img->id,
                    'url' => $img->url,
                    'alt_text' => $img->alt_text,
                ]),
                'variants' => $this->product->variants->map(fn($v) => [
                    'id' => $v->id,
                    'sku' => $v->sku,
                    'price' => (float) $v->price,
                    'stock_quantity' => $v->stock_quantity,
                    'is_default' => $v->is_default ?? false,
                ]),
                'default_variant_id' => $this->product->variants
                    ->where('is_default', true)
                    ->first()
                    ?->id ?? $this->product->variants->first()?->id,
            ],
            'added_at' => $this->created_at->toIso8601String(),
        ];
    }
}
