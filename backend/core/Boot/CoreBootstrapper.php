<?php

namespace Core\Boot;

use Core\Base\Events\EventBus;
use Core\Order\Events\OrderCreated;
use Core\Inventory\Listeners\ReserveStockListener;

class CoreBootstrapper
{
    public static function boot(EventBus $eventBus): void
    {
        // Register Core Listeners
        $eventBus->listen(OrderCreated::class, ReserveStockListener::class);
    }
}
