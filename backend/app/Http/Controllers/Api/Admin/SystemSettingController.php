<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\SystemSetting;

class SystemSettingController extends Controller
{
    /**
     * Get settings by group.
     */
    public function index(Request $request): JsonResponse
    {
        $query = SystemSetting::query();

        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        $settings = $query->get();

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Update settings in bulk.
     * Expected payload: { settings: { 'key': 'value', ... } }
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->settings as $key => $value) {
                // Determine type based on value or existing setting
                // For simplicity, we assume string for now or infer
                
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ], 500);
        }
    }
}
