<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Services\ModuleManager;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    protected ModuleManager $moduleManager;

    public function __construct(ModuleManager $moduleManager)
    {
        $this->moduleManager = $moduleManager;
    }

    /**
     * Get all modules
     */
    public function index(): JsonResponse
    {
        $modules = $this->moduleManager->all();

        return response()->json([
            'success' => true,
            'data' => $modules,
            'features' => $this->moduleManager->getFeatureFlags(),
        ]);
    }

    /**
     * Get feature flags (for frontend)
     */
    public function features(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->moduleManager->getFeatureFlags(),
        ]);
    }

    /**
     * Toggle module active state
     */
    public function toggle(string $slug): JsonResponse
    {
        try {
            $this->moduleManager->toggle($slug);
            $module = Module::where('slug', $slug)->first();

            return response()->json([
                'success' => true,
                'message' => $module->is_active ? 'Module enabled' : 'Module disabled',
                'data' => $module,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update module configuration
     */
    public function updateConfig(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'config' => 'required|array',
        ]);

        try {
            $this->moduleManager->updateConfig($slug, $validated['config']);
            $module = Module::where('slug', $slug)->first();

            return response()->json([
                'success' => true,
                'message' => 'Configuration updated',
                'data' => $module,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
