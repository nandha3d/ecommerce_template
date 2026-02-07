<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCustomization;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CustomizationController extends Controller
{
    /**
     * Get customizations for current user
     */
    public function index(Request $request): JsonResponse
    {
        $customizations = ProductCustomization::where('user_id', $request->user()->id)
            ->with('product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $customizations,
        ]);
    }

    /**
     * Upload customization image
     */
    public function upload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'image' => 'required|image|max:5120', // 5MB max
            'customization_data' => 'nullable|array',
        ]);

        $path = $request->file('image')->store('customizations', 'public');

        $customization = ProductCustomization::create([
            'product_id' => $validated['product_id'],
            'user_id' => $request->user()?->id,
            'session_id' => $request->session()->getId(),
            'uploaded_image' => $path,
            'customization_data' => $validated['customization_data'] ?? [],
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'data' => [
                'id' => $customization->id,
                'image_url' => $customization->uploaded_image_url,
            ],
        ], 201);
    }

    /**
     * Update customization data
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $customization = ProductCustomization::findOrFail($id);

        // Check ownership
        if ($customization->user_id && $customization->user_id !== $request->user()?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$customization->can_edit) {
            return response()->json([
                'success' => false,
                'message' => 'Customization cannot be edited',
            ], 400);
        }

        $validated = $request->validate([
            'customization_data' => 'nullable|array',
            'preview_image' => 'nullable|string',
        ]);

        $customization->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Customization updated',
            'data' => $customization,
        ]);
    }

    /**
     * Submit customization for approval
     */
    public function submit(int $id): JsonResponse
    {
        $customization = ProductCustomization::findOrFail($id);

        $customization->update(['status' => 'submitted']);

        return response()->json([
            'success' => true,
            'message' => 'Customization submitted for review',
        ]);
    }

    /**
     * Delete customization
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $customization = ProductCustomization::findOrFail($id);

        // Check ownership
        if ($customization->user_id && $customization->user_id !== $request->user()?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Delete uploaded files
        if ($customization->uploaded_image) {
            Storage::disk('public')->delete($customization->uploaded_image);
        }
        if ($customization->preview_image) {
            Storage::disk('public')->delete($customization->preview_image);
        }

        $customization->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customization deleted',
        ]);
    }

    /**
     * Admin: Get all customizations
     */
    public function adminIndex(): JsonResponse
    {
        $customizations = ProductCustomization::with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $customizations,
        ]);
    }

    /**
     * Admin: Approve customization
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $customization = ProductCustomization::findOrFail($id);
        $customization->approve($request->input('notes'));

        return response()->json([
            'success' => true,
            'message' => 'Customization approved',
        ]);
    }

    /**
     * Admin: Reject customization
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $customization = ProductCustomization::findOrFail($id);
        $customization->reject($validated['reason']);

        return response()->json([
            'success' => true,
            'message' => 'Customization rejected',
        ]);
    }
}
