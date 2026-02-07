<?php

declare(strict_types=1);

namespace App\Infrastructure\Env;

use RuntimeException;
use Illuminate\Support\Facades\Log;

/**
 * Environment Validator
 * 
 * Validates that all required environment variables are present and non-empty.
 * Application MUST fail fast if any required variable is missing.
 */
final class EnvValidator
{
    /**
     * Required environment variables that MUST be set.
     * Missing or empty values will cause application to CRASH.
     */
    private const REQUIRED_ENV_KEYS = [
        // Core Application
        'APP_KEY' => 'Application encryption key',
        'APP_ENV' => 'Application environment (local/staging/production)',
        
        // Database
        'DB_HOST' => 'Database host',
        'DB_DATABASE' => 'Database name',
        'DB_USERNAME' => 'Database username',
        
        // Authentication
        'JWT_SECRET' => 'JWT signing secret',
    ];

    /**
     * Conditionally required keys based on environment.
     * Only validated in production.
     */
    private const PRODUCTION_REQUIRED_KEYS = [
        'RAZORPAY_KEY_ID' => 'Razorpay API Key ID',
        'RAZORPAY_KEY_SECRET' => 'Razorpay API Key Secret',
    ];

    /**
     * Validate all required environment variables.
     * 
     * @throws RuntimeException if any required variable is missing or empty
     */
    public static function validate(): void
    {
        $missing = [];
        $empty = [];

        // Check core required keys
        foreach (self::REQUIRED_ENV_KEYS as $key => $description) {
            $value = env($key);
            
            if ($value === null) {
                $missing[] = "{$key} ({$description})";
            } elseif (self::isEmpty($value)) {
                $empty[] = "{$key} ({$description})";
            }
        }

        // Check production-only keys
        if (env('APP_ENV') === 'production') {
            foreach (self::PRODUCTION_REQUIRED_KEYS as $key => $description) {
                $value = env($key);
                
                if ($value === null) {
                    $missing[] = "{$key} ({$description})";
                } elseif (self::isEmpty($value)) {
                    $empty[] = "{$key} ({$description})";
                }
            }
        }

        // Fail fast if any issues found
        if (!empty($missing) || !empty($empty)) {
            self::failWithDetails($missing, $empty);
        }
    }

    /**
     * Check if a value is considered empty.
     */
    private static function isEmpty(mixed $value): bool
    {
        if ($value === null || $value === '') {
            return true;
        }

        // Handle string "null" which Laravel sometimes returns
        if (is_string($value) && strtolower(trim($value)) === 'null') {
            return true;
        }

        return false;
    }

    /**
     * Fail the application with detailed error message.
     * 
     * @throws RuntimeException always
     */
    private static function failWithDetails(array $missing, array $empty): never
    {
        $messages = [];

        if (!empty($missing)) {
            $messages[] = "Missing environment variables:\n  - " . implode("\n  - ", $missing);
        }

        if (!empty($empty)) {
            $messages[] = "Empty environment variables:\n  - " . implode("\n  - ", $empty);
        }

        $fullMessage = "CRITICAL: Environment validation failed!\n\n" . implode("\n\n", $messages);

        // Log the error
        Log::critical('Environment validation failed', [
            'missing' => $missing,
            'empty' => $empty,
        ]);

        // Throw exception to crash the application
        throw new RuntimeException($fullMessage);
    }

    /**
     * Get list of all required keys for documentation/testing.
     */
    public static function getRequiredKeys(): array
    {
        return array_keys(self::REQUIRED_ENV_KEYS);
    }

    /**
     * Get list of production-only required keys.
     */
    public static function getProductionRequiredKeys(): array
    {
        return array_keys(self::PRODUCTION_REQUIRED_KEYS);
    }
}
