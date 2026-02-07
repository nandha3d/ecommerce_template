<?php

namespace App\Enums;

enum InventoryReservationState: string
{
    case RESERVED = 'reserved';
    case COMMITTED = 'committed';
    case RELEASED = 'released';
}
