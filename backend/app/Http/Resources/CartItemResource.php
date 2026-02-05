<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Self-healing: If stored price is invalid (0 or null), use current product/variant price
        $unitPrice = (float) $this->unit_price;
        if ($unitPrice <= 0) {
            if ($this->variant_id && $this->relationLoaded('variant') && $this->variant) {
                $unitPrice = (float) ($this->variant->sale_price > 0 ? $this->variant->sale_price : $this->variant->price);
            } elseif ($this->relationLoaded('product') && $this->product) {
                $unitPrice = (float) ($this->product->sale_price > 0 ? $this->product->sale_price : $this->product->price);
            }
        }

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'quantity' => $this->quantity,
            'unit_price' => $unitPrice, // Use healed price
            'total_price' => $unitPrice * $this->quantity, // Recalculate total based on healed price
            'product' => new ProductResource($this->whenLoaded('product')),
            'variant' => $this->whenLoaded('variant'),
        ];
    }
}
