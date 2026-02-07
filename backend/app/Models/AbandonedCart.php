<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbandonedCart extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'user_id',
        'email',
        'phone',
        'cart_value',
        'items_count',
        'recovery_status',
        'recovery_token',
        'abandoned_at',
        'first_reminder_sent_at',
        'second_reminder_sent_at',
        'recovered_at',
    ];

    protected $casts = [
        'cart_value' => 'float',
        'abandoned_at' => 'datetime',
        'first_reminder_sent_at' => 'datetime',
        'second_reminder_sent_at' => 'datetime',
        'recovered_at' => 'datetime',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }
}
