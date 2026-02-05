<?php

namespace Core\Inventory\Services;

use Core\Product\Models\Product;

class InventoryService
{
    /**
     * Decrement product stock.
     */
    public function decrementStock(Product $product, int $quantity): void
    {
        $product->decrement('stock_quantity', $quantity);
        $this->updateStockStatus($product);
    }

    /**
     * Increment product stock (e.g. for cancellations).
     */
    public function incrementStock(Product $product, int $quantity): void
    {
        $product->increment('stock_quantity', $quantity);
        $this->updateStockStatus($product);
    }

    /**
     * Check if product has sufficient stock.
     */
    public function hasStock(Product $product, int $quantity): bool
    {
        return $product->stock_quantity >= $quantity;
    }

    /**
     * Update stock status based on quantity.
     */
    private function updateStockStatus(Product $product): void
    {
        // This logic mimics what was observed in the scan or inferred.
        // Assuming strict 'in_stock' / 'out_of_stock' status string or boolean.
        // If Product model has 'stock_status' column:
        
        /* 
        if ($product->stock_quantity <= 0) {
             $product->stock_status = 'out_of_stock';
        } else {
             $product->stock_status = 'in_stock';
        }
        $product->save();
        */
        
        // However, the Codebase Scan in OrderController had:
        // $cartItem->product->updateStockStatus();
        // This implies the method exists on the Product model.
        // I should stick to calling that method or move it here.
        // The Plan was "Extract logic". If logic is on Model, keep it for now or move it?
        // Better to delegate back to Model for status update to minimize change, 
        // OR move that logic here. 
        // Let's call the Model method for now if it exists.
        
        if (method_exists($product, 'updateStockStatus')) {
            $product->updateStockStatus();
        }
    }
}
