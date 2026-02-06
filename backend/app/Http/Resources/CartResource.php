<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Calculate healed subtotal
        $items = $this->whenLoaded('items');
        $healedSubtotal = 0;
        
        if ($items instanceof \Illuminate\Support\Collection) {
            foreach ($items as $item) {
                $unitPrice = (float) $item->unit_price;
                if ($unitPrice <= 0) {
                     if ($item->variant_id && $item->relationLoaded('variant') && $item->variant) {
                        $unitPrice = (float) ($item->variant->sale_price > 0 ? $item->variant->sale_price : $item->variant->price);
                    } elseif ($item->relationLoaded('product') && $item->product) {
                         // Try to find default variant if not linked
                         $defaultVariant = $item->product->variants->first();
                         if ($defaultVariant) {
                             $unitPrice = (float) ($defaultVariant->sale_price > 0 ? $defaultVariant->sale_price : $defaultVariant->price);
                         }
                    }
                }
                $healedSubtotal += $unitPrice * $item->quantity;
            }
        } else {
             $healedSubtotal = (float) $this->subtotal;
        }

        return [
            'id' => $this->id,
            'session_id' => $this->session_id,
            'user_id' => $this->user_id,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'item_count' => $this->item_count,
            'subtotal' => (float) $healedSubtotal, // Use healed subtotal
            'discount' => (float) $this->discount,
            'shipping' => (float) $this->shipping,
            'tax' => (float) $this->tax,
            'total' => (float) ($healedSubtotal + $this->shipping + $this->tax - $this->discount), // Recalculate total
            'coupon' => $this->whenLoaded('coupon'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
