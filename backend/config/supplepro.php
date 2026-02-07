<?php

return [
    /*
    |--------------------------------------------------------------------------
    | License Portal URL
    |--------------------------------------------------------------------------
    |
    | The URL of your license portal server for online validation.
    | This is where client installations will validate their licenses.
    |
    */
    'license_portal_url' => env('SUPPLEPRO_LICENSE_PORTAL_URL', 'https://license.animazon.in/api'),

    /*
    |--------------------------------------------------------------------------
    | Secret Key for License Verification (HMAC-SHA256)
    |--------------------------------------------------------------------------
    |
    | Shared secret key for verifying license signatures.
    | Must match the key configured on your license portal.
    |
    */
    'license_secret_key' => env('SUPPLEPRO_LICENSE_SECRET_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | License Key
    |--------------------------------------------------------------------------
    |
    | The license key for this installation (if pre-configured).
    | Can also be set via admin panel.
    |
    */
    'license_key' => env('SUPPLEPRO_LICENSE_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Upgrade URL
    |--------------------------------------------------------------------------
    |
    | URL to redirect users for license upgrades.
    |
    */
    'upgrade_url' => env('SUPPLEPRO_UPGRADE_URL', 'https://supplepro.com/pricing'),

    /*
    |--------------------------------------------------------------------------
    | Validation Cache Duration
    |--------------------------------------------------------------------------
    |
    | How long to cache license validation results (in seconds).
    | Default: 24 hours (86400 seconds)
    |
    */
    'cache_duration' => env('SUPPLEPRO_LICENSE_CACHE', 86400),

    /*
    |--------------------------------------------------------------------------
    | Offline Grace Period
    |--------------------------------------------------------------------------
    |
    | Number of days the app can run without online validation.
    | After this period, features may be restricted until revalidation.
    |
    */
    'offline_grace_days' => env('SUPPLEPRO_OFFLINE_GRACE', 7),

    /*
    |--------------------------------------------------------------------------
    | Module Tier Requirements
    |--------------------------------------------------------------------------
    |
    | Defines which tier each module requires.
    | 'starter' = All tiers, 'professional' = Pro & Enterprise, 'enterprise' = Enterprise only
    |
    */
    'module_tiers' => [
        'products' => 'starter',
        'orders' => 'starter',
        'users' => 'starter',
        'coupons' => 'starter',
        'variants' => 'professional',
        'addons' => 'professional',
        'bundles' => 'professional',
        'payments' => 'professional',
        'offers' => 'enterprise',
        'customization' => 'enterprise',
        'minimal-checkout' => 'enterprise',
    ],

    /*
    |--------------------------------------------------------------------------
    | Tier Limits
    |--------------------------------------------------------------------------
    |
    | Usage limits for each license tier.
    |
    */
    'tier_limits' => [
        'starter' => [
            'max_products' => 100,
            'max_orders_monthly' => 50,
            'max_domains' => 1,
        ],
        'professional' => [
            'max_products' => null, // Unlimited
            'max_orders_monthly' => null,
            'max_domains' => 1,
        ],
        'enterprise' => [
            'max_products' => null,
            'max_orders_monthly' => null,
            'max_domains' => 3,
        ],
    ],
];
