<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'razorpay' => [
        'key_id' => env('RAZORPAY_KEY', 'rzp_test_SAWDGjzlq4Lbmg'),
        'key_secret' => env('RAZORPAY_SECRET', '08TezjIUsWPKLtYeu7evQKj0'),
        'currency' => env('RAZORPAY_CURRENCY', 'INR'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

];
