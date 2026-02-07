<?php

namespace App\Services;

use App\Models\License;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class LicenseManager
{
    /**
     * License Portal URL (your Hostinger server)
     */
    protected string $portalUrl;

    /**
     * HMAC Secret Key for signature verification
     * Same key used by License Portal for signing
     */
    protected string $secretKey;

    private ConfigurationService $config;

    public function __construct(ConfigurationService $config)
    {
        $this->config = $config;
        $this->portalUrl = config('supplepro.license_portal_url', 'https://license.animazon.in/api');
        $this->secretKey = config('supplepro.license_secret_key', '');
    }

    protected function getCacheDuration(): int
    {
        return $this->config->getInt('license.cache_duration', 86400);
    }

    /**
     * Activate a license key
     */
    public function activate(string $licenseKey): LicenseResult
    {
        try {
            // Extract key prefix for portal lookup
            $keyPrefix = $this->extractKey($licenseKey);
            
            // Try to decode payload (don't fail if signature check fails)
            $payload = $this->decodePayload($licenseKey);

            // 1. Try online validation with License Portal first
            try {
                $response = Http::timeout(10)->post("{$this->portalUrl}/validate", [
                    'license_key' => $keyPrefix,
                    'license_token' => $licenseKey,
                    'domain' => $this->getCurrentDomain(),
                    'hardware_id' => $this->getHardwareId(),
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    if ($data['valid'] ?? false) {
                        // Extract license details from nested response
                        $licenseData = $data['license'] ?? [];
                        $storeData = [
                            'tier' => $licenseData['tier'] ?? 'starter',
                            'modules' => $licenseData['modules'] ?? [],
                            'expires_at' => $licenseData['expires_at'] ?? null,
                            'support_until' => $licenseData['support_until'] ?? null,
                            'max_products' => $licenseData['max_products'] ?? null,
                            'max_orders_monthly' => $licenseData['max_orders_monthly'] ?? null,
                        ];
                        
                        // Store license locally
                        $this->storeLicense($licenseKey, $storeData);
                        Cache::forget('supplepro_license');
                        return new LicenseResult(true, 'License activated successfully', $storeData);
                    }
                    
                    return new LicenseResult(false, $data['error'] ?? 'Invalid license');
                }
                
                // If portal returned an error (not server error), use that message
                if ($response->status() < 500) {
                    return new LicenseResult(false, $response->json('error', 'License validation failed'));
                }
            } catch (\Exception $e) {
                Log::warning('Portal validation failed, trying offline mode', ['error' => $e->getMessage()]);
            }

            // 2. Fallback to offline validation if portal unavailable
            if ($payload) {
                return $this->activateOffline($payload);
            }

            return new LicenseResult(false, 'License validation failed');

        } catch (\Exception $e) {
            Log::error('License activation failed', ['error' => $e->getMessage()]);
            return new LicenseResult(false, 'License activation failed: ' . $e->getMessage());
        }
    }

    /**
     * Decode license payload (without strict signature verification)
     */
    protected function decodePayload(string $licenseKey): ?array
    {
        $parts = explode('.', $licenseKey);
        
        if (count($parts) !== 3) {
            return null;
        }

        [$prefix, $payload, $signature] = $parts;

        // Verify the prefix format
        if (!preg_match('/^SPLE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/', $prefix)) {
            return null;
        }

        $decoded = json_decode(base64_decode($payload), true);
        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Decode and verify license signature using HMAC-SHA256
     */
    protected function decodeAndVerify(string $licenseKey): ?array
    {
        $parts = explode('.', $licenseKey);
        
        if (count($parts) !== 3) {
            return null;
        }

        [$prefix, $payload, $signature] = $parts;

        // Verify the prefix format
        if (!preg_match('/^SPLE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/', $prefix)) {
            return null;
        }

        // If no secret key configured, skip signature verification (dev mode)
        if (empty($this->secretKey)) {
            $decoded = json_decode(base64_decode($payload), true);
            return is_array($decoded) ? $decoded : null;
        }

        // Verify HMAC-SHA256 signature
        try {
            $expectedSignature = base64_encode(
                hash_hmac('sha256', $payload, $this->secretKey, true)
            );

            if (!hash_equals($expectedSignature, $signature)) {
                Log::warning('License signature mismatch');
                return null;
            }

            return json_decode(base64_decode($payload), true);
        } catch (\Exception $e) {
            Log::warning('Signature verification failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Extract the short key from full license token
     */
    protected function extractKey(string $licenseKey): string
    {
        $parts = explode('.', $licenseKey);
        return $parts[0] ?? $licenseKey;
    }

    /**
     * Activate using offline data only
     */
    protected function activateOffline(array $payload): LicenseResult
    {
        // Check expiration
        if (isset($payload['expires']) && now()->isAfter($payload['expires'])) {
            return new LicenseResult(false, 'License has expired');
        }

        // Check domain binding
        if (isset($payload['domain']) && !$this->matchesDomain($payload['domain'])) {
            return new LicenseResult(false, 'License not valid for this domain');
        }

        // Store offline-validated license
        $this->storeLicense('', [
            'tier' => $payload['tier'] ?? 'starter',
            'modules' => $payload['modules'] ?? [],
            'expires_at' => $payload['expires'] ?? null,
            'offline_mode' => true,
        ]);

        return new LicenseResult(true, 'License activated (offline mode)', $payload);
    }

    /**
     * Store license locally
     */
    protected function storeLicense(string $licenseKey, array $data): void
    {
        License::updateOrCreate(
            ['id' => 1], // Single license per installation
            [
                'license_key' => $this->extractKey($licenseKey),
                'license_token' => $licenseKey,
                'tier' => $data['tier'] ?? 'starter',
                'enabled_modules' => $data['modules'] ?? [],
                'domain' => $this->getCurrentDomain(),
                'hardware_id' => $this->getHardwareId(),
                'max_products' => $data['max_products'] ?? null,
                'max_orders_monthly' => $data['max_orders_monthly'] ?? null,
                'expires_at' => $data['expires_at'] ?? null,
                'support_until' => $data['support_until'] ?? null,
                'last_validated_at' => now(),
                'validation_response' => $data,
                'is_active' => true,
            ]
        );
    }

    /**
     * Get current license
     */
    public function getLicense(): ?License
    {
        return Cache::remember('supplepro_license', $this->getCacheDuration(), function () {
            return License::first();
        });
    }

    /**
     * Check if a module is licensed
     */
    public function hasModule(string $moduleSlug): bool
    {
        $license = $this->getLicense();
        
        if (!$license) {
            return $this->isCoreMod($moduleSlug);
        }

        if (!$license->isValid()) {
            return $this->isCoreMod($moduleSlug);
        }

        return $license->hasModule($moduleSlug);
    }

    /**
     * Check if module is a core module (always available)
     */
    protected function isCoreMod(string $slug): bool
    {
        $coreModules = ['products', 'orders', 'users'];
        return in_array($slug, $coreModules);
    }

    /**
     * Get license status
     */
    public function getStatus(): array
    {
        $license = $this->getLicense();

        if (!$license) {
            return [
                'activated' => false,
                'tier' => 'none',
                'modules' => [],
                'message' => 'No license activated',
            ];
        }

        return [
            'activated' => true,
            'valid' => $license->isValid(),
            'tier' => $license->tier,
            'tier_display' => $license->tier_display,
            'modules' => $license->enabled_modules ?? [],
            'expires_at' => $license->expires_at?->toDateString(),
            'support_until' => $license->support_until?->toDateString(),
            'last_validated' => $license->last_validated_at?->diffForHumans(),
            'status' => $license->status,
        ];
    }

    /**
     * Get all available modules with license status
     */
    public function getModulesWithStatus(): array
    {
        $modules = \App\Models\Module::orderBy('sort_order')->get();
        $license = $this->getLicense();

        return $modules->map(function ($module) use ($license) {
            $isLicensed = $this->hasModule($module->slug);
            
            return [
                'id' => $module->id,
                'name' => $module->name,
                'slug' => $module->slug,
                'description' => $module->description,
                'icon' => $module->icon,
                'is_core' => $module->is_core,
                'is_licensed' => $isLicensed,
                'is_active' => $module->is_active && $isLicensed,
                'can_toggle' => $isLicensed,
            ];
        })->toArray();
    }

    /**
     * Revalidate license with portal
     */
    public function revalidate(): LicenseResult
    {
        $license = $this->getLicense();
        
        if (!$license || empty($license->license_token)) {
            return new LicenseResult(false, 'No license to revalidate');
        }

        return $this->activate($license->license_token);
    }

    /**
     * Get current domain
     */
    protected function getCurrentDomain(): string
    {
        return request()->getHost() ?? config('app.url', 'localhost');
    }

    /**
     * Check if license domain matches current domain
     */
    protected function matchesDomain(string $licensedDomain): bool
    {
        $current = $this->getCurrentDomain();
        
        // Exact match
        if ($licensedDomain === $current) {
            return true;
        }

        // Wildcard subdomain match
        if (str_starts_with($licensedDomain, '*.')) {
            $baseDomain = substr($licensedDomain, 2);
            return str_ends_with($current, $baseDomain);
        }

        // Localhost always matches for development
        if (in_array($current, ['localhost', '127.0.0.1'])) {
            return true;
        }

        return false;
    }

    /**
     * Generate hardware ID for this server
     */
    protected function getHardwareId(): string
    {
        $components = [
            php_uname('n'), // hostname
            php_uname('m'), // machine type
            $_SERVER['SERVER_ADDR'] ?? '',
            realpath(base_path()),
        ];

        return hash('sha256', implode('|', $components));
    }

    /**
     * Deactivate current license
     */
    public function deactivate(): bool
    {
        License::query()->delete();
        Cache::forget('supplepro_license');
        
        return true;
    }
}

/**
 * License validation result
 */
class LicenseResult
{
    public function __construct(
        public bool $success,
        public string $message,
        public array $data = []
    ) {}

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'message' => $this->message,
            'data' => $this->data,
        ];
    }
}
