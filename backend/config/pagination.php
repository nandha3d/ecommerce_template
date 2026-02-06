<?php

return [
    'products' => [
        'default' => env('PAGINATION_PRODUCTS_DEFAULT', 12),
        'max' => env('PAGINATION_PRODUCTS_MAX', 50),
        'featured' => env('PAGINATION_FEATURED', 8),
        'bestsellers' => env('PAGINATION_BESTSELLERS', 8),
        'new_arrivals' => env('PAGINATION_NEW_ARRIVALS', 8),
        'related' => env('PAGINATION_RELATED', 4),
        'reviews' => env('PAGINATION_REVIEWS', 10),
    ],
    'admin' => [
        'default' => env('PAGINATION_ADMIN_DEFAULT', 20),
        'max' => env('PAGINATION_ADMIN_MAX', 100),
    ],
];
