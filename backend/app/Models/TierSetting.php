<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TierSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'limits',
        'features',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'limits' => 'array',
        'features' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
