<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'gateway_class',
        'config',
        'supported_currencies',
        'countries',
        'min_amount',
        'max_amount',
        'transaction_fee_type',
        'transaction_fee_value',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'config' => 'encrypted', // Auto encrypt/decrypt
        'supported_currencies' => 'array',
        'countries' => 'array',
        'is_active' => 'boolean',
        'transaction_fee_value' => 'float',
    ];
}
