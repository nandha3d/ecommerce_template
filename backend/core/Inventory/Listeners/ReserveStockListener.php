<?php

namespace Core\Inventory\Listeners;

use Core\Order\Events\OrderCreated;
use Core\Inventory\Services\InventoryService;
use Core\Base\Events\Event;

class ReserveStockListener
{
    private InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function handle(Event $event): void
    {
        if (!$event instanceof OrderCreated) {
            return;
        }

        foreach ($event->order->items as $item) {
            $variant = $item->variant;
            if (!$variant) {
                 // Try fallback or throw
                 $variant = $item->product->variants->first();
            }
            
            if (!$variant) {
                // Critical Inventory Error
                throw new \RuntimeException("Cannot reserve stock: Variant not found for Item ID {$item->id}");
            }

            $this->inventoryService->decrementStock($variant, $item->quantity);
        }
    }
}
