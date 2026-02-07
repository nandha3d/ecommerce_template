<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Error code mappings for different exception types.
     */
    private const ERROR_CODES = [
        AuthorizationException::class => 'FORBIDDEN',
        AuthenticationException::class => 'UNAUTHENTICATED',
        ModelNotFoundException::class => 'NOT_FOUND',
        NotFoundHttpException::class => 'NOT_FOUND',
        ValidationException::class => 'VALIDATION_ERROR',
        QueryException::class => 'DATABASE_ERROR',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // Log all exceptions with request context
        });

        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $this->handleApiException($e, $request);
            }
        });
    }

    /**
     * Handle API exceptions with standardized format.
     * NEVER exposes internal details in production.
     */
    private function handleApiException(Throwable $e, $request)
    {
        $requestId = $request->attributes->get('request_id');
        $isDebug = config('app.debug');
        
        // Determine HTTP status code
        $status = $this->getStatusCode($e);
        
        // Determine error code
        $errorCode = $this->getErrorCode($e);
        
        // Get user-safe message (NEVER expose internals in production)
        $message = $this->getSafeMessage($e, $isDebug);

        // Build response
        $response = [
            'success' => false,
            'request_id' => $requestId,
            'error_code' => $errorCode,
            'message' => $message,
        ];

        // Add validation errors if applicable
        if ($e instanceof ValidationException) {
            $response['errors'] = $e->errors();
        }

        // ONLY in debug mode: add trace (NEVER in production)
        if ($isDebug) {
            $response['debug'] = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => collect($e->getTrace())->take(5)->toArray(),
            ];
        }

        // Log the full exception internally
        $this->logException($e, $requestId, $status);

        return response()->json($response, $status);
    }

    /**
     * Get HTTP status code from exception.
     */
    private function getStatusCode(Throwable $e): int
    {
        if ($e instanceof HttpException) {
            return $e->getStatusCode();
        }

        if ($e instanceof AuthenticationException) {
            return 401;
        }

        if ($e instanceof AuthorizationException) {
            return 403;
        }

        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return 404;
        }

        if ($e instanceof ValidationException) {
            return 422;
        }

        return 500;
    }

    /**
     * Get machine-readable error code.
     */
    private function getErrorCode(Throwable $e): string
    {
        foreach (self::ERROR_CODES as $exceptionClass => $code) {
            if ($e instanceof $exceptionClass) {
                return $code;
            }
        }

        return 'INTERNAL_ERROR';
    }

    /**
     * Get user-safe error message.
     * In production, NEVER expose SQL, stack traces, or internal paths.
     */
    private function getSafeMessage(Throwable $e, bool $isDebug): string
    {
        // Validation exceptions are always safe to show
        if ($e instanceof ValidationException) {
            return 'Validation failed';
        }

        // HTTP exceptions usually have safe messages
        if ($e instanceof HttpException) {
            return $e->getMessage() ?: 'Request failed';
        }

        // Auth exceptions are safe
        if ($e instanceof AuthorizationException) {
            return 'Access denied';
        }

        if ($e instanceof AuthenticationException) {
            return 'Unauthenticated';
        }

        // Model not found
        if ($e instanceof ModelNotFoundException) {
            return 'Resource not found';
        }

        // Database errors - NEVER expose SQL in production
        if ($e instanceof QueryException) {
            if ($isDebug) {
                return 'Database error: ' . $e->getMessage();
            }
            return 'A database error occurred. Please try again.';
        }

        // Generic exceptions - only show message in debug mode
        if ($isDebug) {
            return $e->getMessage() ?: 'An error occurred';
        }

        // PRODUCTION: Generic safe message
        return 'An unexpected error occurred. Please try again.';
    }

    /**
     * Log exception with full context for debugging.
     */
    private function logException(Throwable $e, ?string $requestId, int $status): void
    {
        $context = [
            'request_id' => $requestId,
            'status' => $status,
            'exception' => get_class($e),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'user_id' => auth()->id(),
        ];

        if ($status >= 500) {
            \Log::error('API Exception', $context);
        } else {
            \Log::warning('API Exception', $context);
        }
    }
}
