<?php

return [
    'products' => [
        'default' => 'created_at',
        'options' => [
            'popularity' => [
                'field' => 'review_count',
                'direction' => 'desc',
            ],
            'price_asc' => [
                'relation_min' => ['variants as min_price', 'price'],
                'field' => 'min_price',
                'direction' => 'asc',
            ],
            'price_desc' => [
                'relation_max' => ['variants as max_price', 'price'],
                'field' => 'max_price',
                'direction' => 'desc',
            ],
            'rating' => [
                'field' => 'average_rating',
                'direction' => 'desc',
            ],
            'newest' => [
                'field' => 'created_at',
                'direction' => 'desc',
            ],
        ],
    ],
];
