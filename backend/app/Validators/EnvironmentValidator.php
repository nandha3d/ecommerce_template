<?php

/**
 * Environment Validation Configuration
 * 
 * Validates that required environment variables are set before app boots.
 * Add to AppServiceProvider boot() method or create a dedicated command.
 */

namespace App\Validators;

use Illuminate\Support\Facades\Log;

class EnvironmentValidator
{
    /**
     * Required environment variables for production
     */
    protected static array $required = [
        'APP_KEY',
        'APP_ENV',
        'APP_URL',
        'DB_HOST',
        'DB_DATABASE',
        'DB_USERNAME',
        'DB_PASSWORD',
        'JWT_SECRET',
    ];

    /**
     * Recommended environment variables (warn if missing)
     */
    protected static array $recommended = [
        'MAIL_HOST' => 'Email functionality unavailable',
        'RAZORPAY_KEY_ID' => 'Payment gateway unavailable',
        'RAZORPAY_KEY_SECRET' => 'Payment gateway unavailable',
    ];

    /**
     * Validate all environment variables
     */
    public static function validate(): array
    {
        $errors = [];
        $warnings = [];

        // Check required vars
        foreach (self::$required as $var) {
            if (empty(env($var))) {
                $errors[] = "Required env variable {$var} is not set";
            }
        }

        // Check recommended vars (production only)
        if (app()->isProduction()) {
            foreach (self::$recommended as $var => $message) {
                if (empty(env($var))) {
                    $warnings[] = "{$var}: {$message}";
                }
            }
        }

        // Log warnings
        foreach ($warnings as $warning) {
            Log::warning("Environment: {$warning}");
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
        ];
    }

    /**
     * Validate and throw exception on errors (use in boot)
     */
    public static function validateOrFail(): void
    {
        $result = self::validate();
        
        if (!$result['valid']) {
            throw new \RuntimeException(
                'Environment validation failed: ' . implode(', ', $result['errors'])
            );
        }
    }
}
