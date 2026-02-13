<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /*
     * SECURITY: Only allow requests from your actual frontend domain
     * In production, this MUST be set to your real domain
     * Example: 'https://shop.example.com'
     */
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        // Add additional allowed origins here if needed
        // env('MOBILE_APP_URL'),
    ],

    'allowed_origins_patterns' => [],

    /*
     * SECURITY: Only allow necessary headers
     * This prevents malicious header injection
     */
    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
        'X-Cart-Session',
        'X-CSRF-Token',
    ],

    /*
     * Expose headers that frontend needs to read
     */
    'exposed_headers' => [
        'X-Cart-Session',
    ],

    'max_age' => 0,

    /*
     * SECURITY: Enable credentials for cookie-based authentication
     * This is safe when allowed_origins is restricted
     */
    'supports_credentials' => true,

];
