<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LicenseManager;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LicenseController extends Controller
{
    protected LicenseManager $licenseManager;

    public function __construct(LicenseManager $licenseManager)
    {
        $this->licenseManager = $licenseManager;
    }

    /**
     * Activate a license key
     * POST /api/v1/license/activate
     */
    public function activate(Request $request): JsonResponse
    {
        $request->validate([
            'license_key' => 'required|string|min:20',
        ]);

        $result = $this->licenseManager->activate($request->input('license_key'));

        return response()->json([
            'success' => $result->success,
            'message' => $result->message,
            'data' => $result->data,
        ], $result->success ? 200 : 400);
    }

    /**
     * Get current license status
     * GET /api/v1/license/status
     */
    public function status(): JsonResponse
    {
        $status = $this->licenseManager->getStatus();

        return response()->json([
            'success' => true,
            'data' => $status,
        ]);
    }

    /**
     * Get modules with license status
     * GET /api/v1/license/modules
     */
    public function modules(): JsonResponse
    {
        $modules = $this->licenseManager->getModulesWithStatus();

        return response()->json([
            'success' => true,
            'data' => $modules,
        ]);
    }

    /**
     * Revalidate license with portal
     * POST /api/v1/license/revalidate
     */
    public function revalidate(): JsonResponse
    {
        $result = $this->licenseManager->revalidate();

        return response()->json([
            'success' => $result->success,
            'message' => $result->message,
            'data' => $result->data,
        ], $result->success ? 200 : 400);
    }

    /**
     * Deactivate current license
     * POST /api/v1/license/deactivate
     */
    public function deactivate(): JsonResponse
    {
        $this->licenseManager->deactivate();

        return response()->json([
            'success' => true,
            'message' => 'License deactivated',
        ]);
    }

    /**
     * Check if specific module is licensed
     * GET /api/v1/license/check/{module}
     */
    public function checkModule(string $module): JsonResponse
    {
        $hasModule = $this->licenseManager->hasModule($module);

        return response()->json([
            'success' => true,
            'module' => $module,
            'licensed' => $hasModule,
        ]);
    }
}
