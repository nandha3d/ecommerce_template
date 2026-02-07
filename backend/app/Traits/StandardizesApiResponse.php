<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait StandardizesApiResponse
{
    /**
     * Send a standardized success response.
     */
    protected function success(mixed $data = null, string $message = 'Success', int $code = 200, array $headers = []): JsonResponse
    {
        return response()->json([
            'success' => true,
            'request_id' => request()->attributes->get('request_id'),
            'message' => $message,
            'data' => $data,
        ], $code, $headers);
    }

    /**
     * Send a standardized error response.
     * 
     * @param string $message User-friendly error message
     * @param string|null $errorCode Machine-readable error code (from ApiErrorCode enum)
     * @param int $code HTTP status code
     * @param mixed $data Optional extra debug/context data
     */
    protected function error(string $message = 'Error', ?string $errorCode = null, int $code = 400, mixed $data = null): JsonResponse
    {
        $response = [
            'success' => false,
            'request_id' => request()->attributes->get('request_id'),
            'error_code' => $errorCode,
            'message' => $message,
        ];

        // Only include data in non-production for debugging
        if ($data !== null && config('app.debug')) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }
}
