<?php

namespace Core\Pricing\Services;

use Core\Pricing\Models\PricingRule;
use Core\Pricing\Repositories\PricingRuleRepository;
use App\Models\Cart;

class RuleEngine
{
    private PricingRuleRepository $repository;

    public function __construct(PricingRuleRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Apply active pricing rules to the cart and return total discount.
     */
    public function calculateCartDiscount(Cart $cart): float
    {
        $rules = $this->repository->getActiveRules();
        $totalDiscount = 0;
        $subtotal = $cart->items->sum('total_price'); // This assumes CartItem is still Eloquent, which is allowed for "Legacy" but ideally Core shouldn't know.
        // For now, Cart is App/Models/Cart so it's fine.

        foreach ($rules as $rule) {
            if ($this->matchesConditions($rule, $cart, $subtotal)) {
                $totalDiscount += $this->calculateActionDiscount($rule, $subtotal);
            }
        }

        return $totalDiscount;
    }

    private function matchesConditions(PricingRule $rule, Cart $cart, float $subtotal): bool
    {
        $conditions = $rule->conditions ?? [];

        foreach ($conditions as $key => $value) {
            switch ($key) {
                case 'min_subtotal':
                    if ($subtotal < $value) return false;
                    break;
                case 'min_items':
                    if ($cart->items->sum('quantity') < $value) return false;
                    break;
                // Add more conditions as needed
            }
        }

        return true;
    }

    private function calculateActionDiscount(PricingRule $rule, float $subtotal): float
    {
        $actions = $rule->actions ?? [];
        $discount = 0;

        foreach ($actions as $key => $value) {
            // Check if actions is an associative array or list of actions. 
            // Assuming simple key-value for single action or structured array.
            // Let's assume schema: "type": "percentage", "value": 10
            
            $type = $actions['type'] ?? null;
            $val = $actions['value'] ?? 0;

            if ($type === 'percentage_discount') {
                $discount += $subtotal * ($val / 100);
            } elseif ($type === 'fixed_discount') {
                $discount += $val;
            }
        }

        return $discount;
    }
}
