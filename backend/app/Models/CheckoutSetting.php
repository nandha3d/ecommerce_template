<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckoutSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
    ];

    /**
     * Get typed value
     */
    public function getTypedValueAttribute()
    {
        switch ($this->type) {
            case 'boolean':
                return filter_var($this->value, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return (int) $this->value;
            case 'json':
                return json_decode($this->value, true);
            default:
                return $this->value;
        }
    }

    /**
     * Get setting by key
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->typed_value : $default;
    }

    /**
     * Set setting value
     */
    public static function set(string $key, $value, string $type = 'string', string $group = 'general')
    {
        if ($type === 'json' && is_array($value)) {
            $value = json_encode($value);
        } elseif ($type === 'boolean') {
            $value = $value ? 'true' : 'false';
        }

        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type, 'group' => $group]
        );
    }

    /**
     * Get all settings as array
     */
    public static function getAllAsArray(): array
    {
        return self::all()->pluck('typed_value', 'key')->toArray();
    }

    /**
     * Get settings by group
     */
    public static function getByGroup(string $group): array
    {
        return self::where('group', $group)
            ->get()
            ->pluck('typed_value', 'key')
            ->toArray();
    }
}
