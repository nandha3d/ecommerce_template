<?php

namespace Core\System\Services;

use App\Models\Timezone;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class TimezoneService
{
    private const CACHE_TTL = 3600;

    /**
     * Get System Default Timezone (Usually UTC or server default).
     */
    public function getDefaultTimezone(): Timezone
    {
        return Cache::remember('timezone:default', self::CACHE_TTL, function () {
            return Timezone::where('is_default', true)->firstOrFail();
        });
    }

    /**
     * Resolve User Timezone.
     * Logic: User Setting > Guest Cookie > System Default.
     */
    public function getUserTimezone(?string $requestedIdentifier = null): Timezone
    {
        if ($requestedIdentifier) {
            $tz = $this->getTimezoneByIdentifier($requestedIdentifier);
            if ($tz && $tz->is_active) {
                return $tz;
            }
        }

        // TODO: Auth check

        return $this->getDefaultTimezone();
    }

    public function getTimezoneByIdentifier(string $identifier): ?Timezone
    {
        return Cache::remember("timezone:id:{$identifier}", self::CACHE_TTL, function () use ($identifier) {
            return Timezone::where('identifier', $identifier)->first();
        });
    }

    public function getAllActive()
    {
        return Cache::remember('timezone:active_list', self::CACHE_TTL, function () {
            return Timezone::where('is_active', true)->get();
        });
    }

    /**
     * Convert UTC timestamp to User Display Time.
     * Returns Carbon instance in user's timezone.
     */
    public function toLocal(Carbon $utcTimestamp, ?string $userTimezone = null): Carbon
    {
        $tz = $userTimezone 
            ? $this->getUserTimezone($userTimezone) 
            : $this->getUserTimezone(); // Defaults to request context if we implemented middleware

        return $utcTimestamp->setTimezone($tz->identifier);
    }
}
