<?php

namespace Core\Cart\Events;

use Core\Base\Events\Event;
use App\Models\Cart;
use App\Models\CartItem;

class ItemRemoved implements Event
{
    public function __construct(
        public Cart $cart,
        public CartItem $item
    ) {}
}
