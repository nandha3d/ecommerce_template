<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CartPricingRule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class PricingEngineService
{
    /**
     * Apply all active pricing rules to the cart
     */
    public function applyRules(Cart $cart): Cart
    {
        // 1. Reset any existing discount amounts to avoid double counting if called multiple times
        $this->resetDiscounts($cart);

        // 2. Fetch active rules
        // In a real implementation, we would fetch from DB, cached.
        // For now, we simulate rule fetching or check basic logic.
        $rules = $this->getActiveRules();

        foreach ($rules as $rule) {
            if ($this->canApplyRule($rule, $cart)) {
                $this->applyRule($rule, $cart);
            }
        }

        // 3. Recalculate totals
        $this->recalculateTotals($cart);

        return $cart;
    }

    private function resetDiscounts(Cart $cart)
    {
        foreach ($cart->items as $item) {
            // $item->discount_amount = 0; // Column does not exist
            // $item->save(); 
        }
        $cart->discount = 0; // Correct column is 'discount'
    }

    private function getActiveRules(): Collection
    {
        // Mocking rules for now or fetching from DB if table exists.
        // Assuming CartPricingRule model exists
        try {
            return CartPricingRule::where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
                })
                ->orderBy('priority', 'desc')
                ->get();
        } catch (\Exception $e) {
            Log::warning("PricingEngine: Could not fetch rules. Table might be missing.");
            return collect([]);
        }
    }

    private function canApplyRule(CartPricingRule $rule, Cart $cart): bool
    {
        $conditions = $rule->conditions ?? [];
        
        // Example Condition: Invalid if subtotal is below X
        if (isset($conditions['min_subtotal']) && $cart->subtotal < $conditions['min_subtotal']) {
            return false;
        }

        return true;
    }

    private function applyRule(CartPricingRule $rule, Cart $cart)
    {
        $actions = $rule->actions ?? [];
        $type = $rule->type;

        switch ($type) {
            case 'quantity_discount':
                $this->applyQuantityDiscount($actions, $cart);
                break;
            case 'bogo':
                // Implement BOGO logic
                break;
            // ... other types
        }
    }

    private function applyQuantityDiscount(array $actions, Cart $cart)
    {
        // Logic: if item quantity > X, apply Y discount
        // This is a simplified version.
    }

    public function recalculateTotals(Cart $cart): void
    {
        $subtotal = 0;
        $totalDiscount = 0;
        $totalTax = 0;

        foreach ($cart->items as $item) {
            // Recalculate item subtotal
            $itemSubtotal = $item->quantity * $item->unit_price;
            
            // Adjust for discounts applied to item
            // Note: DB doesn't support per-item discount persistence yet, so we use local variable
            $itemDiscount = 0; 
            $discountedPrice = $itemSubtotal - $itemDiscount;
            
            // Calculate Tax (simplified generic 18% or from config)
            // Ideally use TaxCalculationService
            $taxRate = 0.0; // Assume 0 for now until TaxService is fully integrated
            $itemTax = $discountedPrice * $taxRate;
            
            // We cannot save these to DB as columns don't exist in cart_items table
            // $item->tax_amount = $itemTax;
            // $item->subtotal = $itemSubtotal;
            // $item->total = $discountedPrice + $itemTax;
            
            // item->save(); implicitly if passed by reference and saved later
            // Only unit_price and quantity are persistent
            
            $subtotal += $itemSubtotal;
            $totalDiscount += $itemDiscount;
            $totalTax += $itemTax;
        }

        $cart->subtotal = $subtotal;
        $cart->discount = $totalDiscount; // Correct column name is 'discount'
        $cart->tax_amount = $totalTax;
        
        // Shipping would be added here
        $shipping = $cart->shipping_cost ?? 0;
        
        $cart->total = $subtotal - $totalDiscount + $totalTax + $shipping;
    }
}
