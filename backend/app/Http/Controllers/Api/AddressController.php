<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\Auth;
use App\Services\AddressValidationService;

class AddressController extends Controller
{
    protected AddressValidationService $validationService;

    public function __construct(AddressValidationService $validationService)
    {
        $this->validationService = $validationService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $addresses = Auth::user()->addresses()->orderBy('is_default', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $addresses
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:billing,shipping',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'is_default' => 'boolean'
        ]);

        // Enhanced Validation
        $validationResult = $this->validationService->validate($validated);
        if (!$validationResult['isValid']) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validationResult['errors']
            ], 422);
        }
        
        // Use normalized data
        $validated = $validationResult['normalizedData'];

        $user = Auth::user();

        // If this is the first address or marked as default, unset other defaults of same type
        if ($user->addresses()->count() === 0 || $request->is_default) {
            $validated['is_default'] = true;
            if ($request->is_default) {
                $user->addresses()->where('type', $validated['type'])->update(['is_default' => false]);
            }
        }

        $address = $user->addresses()->create($validated);

        return response()->json([
            'success' => true,
            'data' => $address,
            'message' => 'Address created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $address = Auth::user()->addresses()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $address
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $address = Auth::user()->addresses()->findOrFail($id);

        $validated = $request->validate([
            'type' => 'in:billing,shipping',
            'name' => 'string|max:255',
            'phone' => 'string|max:20',
            'address_line_1' => 'string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'string|max:100',
            'state' => 'string|max:100',
            'postal_code' => 'string|max:20',
            'country' => 'string|max:100',
            'is_default' => 'boolean'
        ]);

        if (isset($validated['is_default']) && $validated['is_default']) {
            Auth::user()->addresses()
                ->where('type', $address->type)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'success' => true,
            'data' => $address,
            'message' => 'Address updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $address = Auth::user()->addresses()->findOrFail($id);
        
        // If deleting default address, make another one default if exists
        $wasDefault = $address->is_default;
        $type = $address->type;
        
        $address->delete();

        if ($wasDefault) {
            $newDefault = Auth::user()->addresses()
                ->where('type', $type)
                ->first();
            
            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Address deleted successfully'
        ]);
    }

    /**
     * Set address as default.
     */
    public function setDefault(Request $request, string $id)
    {
        $address = Auth::user()->addresses()->findOrFail($id);
        
        Auth::user()->addresses()
            ->where('type', $address->type)
            ->update(['is_default' => false]);
            
        $address->update(['is_default' => true]);

        return response()->json([
            'success' => true,
            'data' => $address,
            'message' => 'Address set as default'
        ]);
    }
}
