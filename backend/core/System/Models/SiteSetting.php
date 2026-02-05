<?php

namespace Core\System\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'group', 'is_public'];

    protected $casts = [
        'is_public' => 'boolean',
    ];
}
