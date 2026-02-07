<?php

return [
    'low_stock_threshold' => env('INVENTORY_LOW_STOCK_THRESHOLD', 10),
    'out_of_stock_threshold' => env('INVENTORY_OUT_OF_STOCK_THRESHOLD', 0),
    'auto_stock_status' => env('INVENTORY_AUTO_STATUS', true),
];
