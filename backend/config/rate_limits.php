<?php

return [
    'auth' => [
        'attempts' => env('RATE_LIMIT_AUTH_ATTEMPTS', 5),
        'decay' => env('RATE_LIMIT_AUTH_DECAY', 60),
    ],
    'checkout' => [
        'attempts' => env('RATE_LIMIT_CHECKOUT_ATTEMPTS', 10),
        'decay' => env('RATE_LIMIT_CHECKOUT_DECAY', 60),
    ],
    'api' => [
        'attempts' => env('RATE_LIMIT_API_ATTEMPTS', 60),
        'decay' => env('RATE_LIMIT_API_DECAY', 60),
    ],
    'search' => [
        'attempts' => env('RATE_LIMIT_SEARCH_ATTEMPTS', 30),
        'decay' => env('RATE_LIMIT_SEARCH_DECAY', 60),
    ],
    'cart' => [
        'attempts' => env('RATE_LIMIT_CART_ATTEMPTS', 30),
        'decay' => env('RATE_LIMIT_CART_DECAY', 60),
    ],
    'order' => [
        'attempts' => env('RATE_LIMIT_ORDER_ATTEMPTS', 3),
        'decay' => env('RATE_LIMIT_ORDER_DECAY', 60),
    ],
    'coupon' => [
        'attempts' => env('RATE_LIMIT_COUPON_ATTEMPTS', 5),
        'decay' => env('RATE_LIMIT_COUPON_DECAY', 60),
    ],
    'payment' => [
        'attempts' => env('RATE_LIMIT_PAYMENT_ATTEMPTS', 10),
        'decay_minutes' => env('RATE_LIMIT_PAYMENT_DECAY_MINUTES', 5),
    ],
];
