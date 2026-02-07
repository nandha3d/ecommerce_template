<?php

namespace Core\Order\Events;

use Core\Base\Events\Event;
use App\Models\Order;

class OrderCreated implements Event
{
    public function __construct(
        public Order $order
    ) {}
}
