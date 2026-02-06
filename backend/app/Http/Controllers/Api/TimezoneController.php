<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Core\System\Services\TimezoneService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cookie;

class TimezoneController extends Controller
{
    private TimezoneService $timezoneService;

    public function __construct(TimezoneService $timezoneService)
    {
        $this->timezoneService = $timezoneService;
    }

    /**
     * List active timezones.
     */
    public function index(): JsonResponse
    {
        $timezones = $this->timezoneService->getAllActive();
        return response()->json(['data' => $timezones]);
    }

    /**
     * Switch Display Timezone.
     */
    public function switch(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string|exists:timezones,identifier,is_active,1',
        ]);

        $identifier = $request->input('identifier');
        
        // TODO: If auth, update user profile.

        // Queue cookie
        $cookie = Cookie::make('timezone', $identifier, 60 * 24 * 365, null, null, false, false);

        return response()->json([
            'message' => 'Timezone updated',
            'timezone' => $this->timezoneService->getTimezoneByIdentifier($identifier)
        ])->withCookie($cookie);
    }
}
