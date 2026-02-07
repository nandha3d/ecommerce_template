<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Timezone;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class TimezoneAdminController extends Controller
{
    /**
     * List all timezones (Admin).
     */
    public function index(): JsonResponse
    {
        $timezones = Timezone::all();
        return response()->json(['data' => $timezones]);
    }

    /**
     * Create a new timezone.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => 'required|string|max:100|unique:timezones,identifier',
            'label' => 'required|string|max:100',
            'offset' => 'required|string|max:10|regex:/^[+-]\d{2}:\d{2}$/',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Validate that the identifier is a valid PHP timezone
        if (!in_array($validated['identifier'], timezone_identifiers_list())) {
            return response()->json([
                'error' => 'Invalid timezone identifier. Must be a valid IANA timezone (e.g., Asia/Kolkata, America/New_York)'
            ], 400);
        }

        // If this is the first timezone, make it default
        if (Timezone::count() === 0) {
            $validated['is_default'] = true;
            $validated['is_active'] = true;
        }

        // If setting as default, clear other defaults
        if ($validated['is_default'] ?? false) {
            Timezone::where('is_default', true)->update(['is_default' => false]);
        }

        $timezone = Timezone::create($validated);
        $this->clearCache();

        return response()->json([
            'message' => 'Timezone created successfully',
            'data' => $timezone
        ], 201);
    }

    /**
     * Update a timezone.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $timezone = Timezone::findOrFail($id);

        $validated = $request->validate([
            'label' => 'sometimes|string|max:100',
            'offset' => 'sometimes|string|max:10|regex:/^[+-]\d{2}:\d{2}$/',
            'is_active' => 'sometimes|boolean',
        ]);

        // Cannot deactivate default timezone
        if ($timezone->is_default && isset($validated['is_active']) && !$validated['is_active']) {
            return response()->json(['error' => 'Cannot deactivate default timezone. Set another timezone as default first.'], 400);
        }

        $timezone->update($validated);
        $this->clearCache();

        return response()->json(['message' => 'Timezone updated', 'data' => $timezone]);
    }

    /**
     * Delete a timezone.
     */
    public function destroy(int $id): JsonResponse
    {
        $timezone = Timezone::findOrFail($id);

        if ($timezone->is_default) {
            return response()->json(['error' => 'Cannot delete default timezone. Set another timezone as default first.'], 400);
        }

        $timezone->delete();
        $this->clearCache();

        return response()->json(['message' => 'Timezone deleted successfully']);
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(int $id): JsonResponse
    {
        $timezone = Timezone::findOrFail($id);

        if ($timezone->is_default && $timezone->is_active) {
            return response()->json(['error' => 'Cannot deactivate default timezone'], 400);
        }

        $timezone->update(['is_active' => !$timezone->is_active]);
        $this->clearCache();
        
        return response()->json(['message' => 'Status updated', 'data' => $timezone]);
    }

    /**
     * Set default timezone.
     */
    public function setDefault(int $id): JsonResponse
    {
        $timezone = Timezone::findOrFail($id);
        
        if (!$timezone->is_active) {
            return response()->json(['error' => 'Cannot set inactive timezone as default'], 400);
        }

        Timezone::where('is_default', true)->update(['is_default' => false]);
        $timezone->update(['is_default' => true]);
        $this->clearCache();

        return response()->json(['message' => 'Default timezone updated', 'data' => $timezone]);
    }

    /**
     * Get list of valid IANA timezone identifiers.
     * Used by frontend for autocomplete/validation.
     */
    public function validIdentifiers(): JsonResponse
    {
        return response()->json([
            'data' => timezone_identifiers_list()
        ]);
    }

    private function clearCache(): void
    {
        Cache::forget('timezone:default');
        Cache::forget('timezone:active_list');
    }
}
