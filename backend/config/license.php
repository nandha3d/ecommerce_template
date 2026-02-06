<?php

return [
    'portal_url' => env('LICENSE_PORTAL_URL', 'https://license.animazon.in/api'),
    'verify_endpoint' => '/verify',
    'cache_duration' => env('LICENSE_CACHE_DURATION', 86400),
    'offline_grace_days' => env('LICENSE_OFFLINE_GRACE_DAYS', 7),
    'secret_key' => env('LICENSE_SECRET_KEY', ''),
];
