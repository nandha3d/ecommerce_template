<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Upload single or multiple images.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max per image
            'folder' => 'nullable|string|max:100',
        ]);

        $folder = $request->input('folder', 'products');
        $uploadedImages = [];

        foreach ($request->file('images') as $image) {
            $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs("uploads/{$folder}", $filename, 'public');
            
            $uploadedImages[] = [
                'url' => Storage::url($path),
                'path' => $path,
                'filename' => $filename,
                'original_name' => $image->getClientOriginalName(),
                'size' => $image->getSize(),
                'mime_type' => $image->getMimeType(),
            ];
        }

        return response()->json([
            'success' => true,
            'message' => count($uploadedImages) . ' image(s) uploaded successfully',
            'data' => $uploadedImages,
        ]);
    }

    /**
     * Upload single image (for variants, etc).
     */
    public function uploadSingle(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'folder' => 'nullable|string|max:100',
        ]);

        $folder = $request->input('folder', 'products');
        $image = $request->file('image');
        
        $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs("uploads/{$folder}", $filename, 'public');

        return response()->json([
            'success' => true,
            'data' => [
                'url' => Storage::url($path),
                'path' => $path,
                'filename' => $filename,
            ],
        ]);
    }

    /**
     * Delete an uploaded image.
     */
    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');
        
        // Security check - only allow deletion from uploads folder
        if (!str_starts_with($path, 'uploads/')) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid path',
            ], 403);
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Image not found',
        ], 404);
    }
}
