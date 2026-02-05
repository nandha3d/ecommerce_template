<?php

namespace Core\System\Controllers;

use App\Http\Controllers\Controller;
use Core\System\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class SystemController extends Controller
{
    public function getConfig(): JsonResponse
    {
        $settings = SiteSetting::where('is_public', true)
            ->get()
            ->mapWithKeys(function ($setting) {
                return [$setting->key => $setting->value];
            });

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }
}
