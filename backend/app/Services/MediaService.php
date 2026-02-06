<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    /**
     * Upload a file to the specified disk and folder.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param string $disk
     * @return string
     */
    public function upload(UploadedFile $file, string $folder = 'uploads', string $disk = 'public'): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, $disk);

        if ($disk === 'public') {
            return '/storage/' . $path;
        }

        return $path;
    }

    /**
     * Delete a file from storage.
     *
     * @param string $path
     * @param string $disk
     * @return bool
     */
    public function delete(string $path, string $disk = 'public'): bool
    {
        // Remove /storage/ prefix if present for public disk
        if ($disk === 'public') {
            $path = str_replace('/storage/', '', $path);
        }

        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }

        return false;
    }
}
