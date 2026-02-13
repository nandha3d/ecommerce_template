<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Core\System\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    protected LocationService $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * Get countries.
     */
    public function getCountries(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->locationService->getCountries()
        ]);
    }

    /**
     * Get states.
     */
    public function getStates(string $countryCode): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->locationService->getStates($countryCode)
        ]);
    }
}
