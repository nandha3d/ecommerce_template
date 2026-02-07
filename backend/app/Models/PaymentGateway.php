<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'provider',
        'description',
        'logo',
        'config',
        'supported_currencies',
        'transaction_fee',
        'fee_type',
        'is_test_mode',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'config' => 'array',
        'supported_currencies' => 'array',
        'transaction_fee' => 'decimal:2',
        'is_test_mode' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'config', // Hide API keys from responses
    ];

    const PROVIDER_RAZORPAY = 'razorpay';
    const PROVIDER_STRIPE = 'stripe';
    const PROVIDER_PAYPAL = 'paypal';
    const PROVIDER_COD = 'cod';

    /**
     * Get transactions for this gateway
     */
    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class, 'gateway_id');
    }

    /**
     * Get API key (safely)
     */
    public function getApiKey(): ?string
    {
        $key = $this->is_test_mode ? 'test_api_key' : 'live_api_key';
        return $this->config[$key] ?? null;
    }

    /**
     * Get API secret (safely)
     */
    public function getApiSecret(): ?string
    {
        $key = $this->is_test_mode ? 'test_api_secret' : 'live_api_secret';
        return $this->config[$key] ?? null;
    }

    /**
     * Calculate transaction fee for amount
     */
    public function calculateFee(float $amount): float
    {
        if ($this->fee_type === 'percentage') {
            return $amount * ($this->transaction_fee / 100);
        }
        return $this->transaction_fee;
    }

    /**
     * Check if gateway supports currency
     */
    public function supportsCurrency(string $currency): bool
    {
        if (!$this->supported_currencies) return true;
        return in_array(strtoupper($currency), $this->supported_currencies);
    }

    /**
     * Scope for active gateways
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
