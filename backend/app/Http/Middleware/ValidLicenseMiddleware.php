<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\LicenseManager;
use Symfony\Component\HttpFoundation\Response;

class ValidLicenseMiddleware
{
    protected LicenseManager $licenseManager;

    public function __construct(LicenseManager $licenseManager)
    {
        $this->licenseManager = $licenseManager;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ?string $module = null): Response
    {
        // If no specific module required, just check for valid license
        if ($module === null) {
            $license = $this->licenseManager->getLicense();
            
            if (!$license || !$license->isValid()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Valid license required',
                    'code' => 'LICENSE_REQUIRED',
                    'upgrade_url' => config('supplepro.upgrade_url', 'https://supplepro.com/pricing'),
                ], 403);
            }

            return $next($request);
        }

        // Check for specific module license
        if (!$this->licenseManager->hasModule($module)) {
            return response()->json([
                'success' => false,
                'error' => "The '{$module}' module is not included in your license",
                'code' => 'MODULE_NOT_LICENSED',
                'module' => $module,
                'current_tier' => $this->licenseManager->getStatus()['tier'] ?? 'none',
                'upgrade_url' => config('supplepro.upgrade_url', 'https://supplepro.com/pricing'),
                'message' => $this->getUpgradeMessage($module),
            ], 403);
        }

        return $next($request);
    }

    /**
     * Get upgrade message for module
     */
    protected function getUpgradeMessage(string $module): string
    {
        $moduleNames = [
            'addons' => 'Product Add-ons',
            'bundles' => 'Bundles & Combos',
            'offers' => 'Price Offers',
            'variants' => 'Product Variants',
            'payments' => 'Multiple Payment Gateways',
            'customization' => 'Image Customization',
            'minimal-checkout' => 'Distraction-Free Checkout',
        ];

        $name = $moduleNames[$module] ?? ucfirst($module);

        return "Upgrade your license to unlock {$name}. Visit our pricing page to see available plans.";
    }
}
