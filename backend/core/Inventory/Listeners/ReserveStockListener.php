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
            $this->inventoryService->decrementStock($item->product, $item->quantity);
        }
    }
}
