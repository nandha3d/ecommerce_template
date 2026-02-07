<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class LicensingService
{
    /**
     * Check if the application has a valid license.
     * 
     * @return bool
     */
    public function verify(): bool
    {
        // For development/demo purposes, we can bypass or mock this.
        if (app()->environment('local')) {
            return true;
        }

        return Cache::remember('app_license_status', 3600, function () {
            try {
                $response = Http::timeout(5)->post(config('product.license_check_url'), [
                    'key' => config('app.key'), // simplified identification
                    'domain' => request()->getHost(),
                ]);

                return $response->successful() && $response->json('valid') === true;
            } catch (\Exception $e) {
                // Fail open or closed depending on business requirement. 
                // Failing open for now to strictly avoid breakage.
                return true; 
            }
        });
    }

    /**
     * Get product version info.
     *
     * @return array
     */
    public function info(): array
    {
        return config('product');
    }
}
