<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'carrier',
        'pricing_config',
        'delivery_days_min',
        'delivery_days_max',
        'countries',
        'excluded_countries',
        'min_order_amount',
        'max_order_amount',
        'max_weight',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'pricing_config' => 'array',
        'countries' => 'array',
        'excluded_countries' => 'array',
        'is_active' => 'boolean',
    ];
}
