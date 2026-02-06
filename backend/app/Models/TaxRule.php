<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'country_code',
        'state_code',
        'city',
        'zip_code',
        'tax_rate',
        'compound',
        'applies_to',
        'category_ids',
        'priority',
        'is_active',
    ];

    protected $casts = [
        'category_ids' => 'array',
        'tax_rate' => 'float',
        'compound' => 'boolean',
        'is_active' => 'boolean',
    ];
}
