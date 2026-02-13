<?php

namespace Core\Cart\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Address; // Use App\Models\Address
use App\Models\ShippingMethod;
use Core\Product\Models\Product;
use App\Models\ProductVariant;
use Core\Base\Events\EventBus;
use Core\Cart\Events\ItemAdded;
use Core\Cart\Events\ItemRemoved;
use App\Repositories\CartRepositoryInterface;
use App\Services\ConfigurationService;
use App\Services\Cart\PricingEngineService;
use App\Services\Cart\TaxCalculationService;
use App\Services\Cart\ShippingCalculationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException; 
use RuntimeException;

class CartService
{
    private EventBus $eventBus;
    private CartRepositoryInterface $cartRepository;
    private ConfigurationService $config;
    private PricingEngineService $pricingEngine;
    private TaxCalculationService $taxService;
    private ShippingCalculationService $shippingService;

    public function __construct(
        EventBus $eventBus,
        CartRepositoryInterface $cartRepository,
        ConfigurationService $config,
        PricingEngineService $pricingEngine,
        TaxCalculationService $taxService,
        ShippingCalculationService $shippingService
    ) {
        $this->eventBus = $eventBus;
        $this->cartRepository = $cartRepository;
        $this->config = $config;
        $this->pricingEngine = $pricingEngine;
        $this->taxService = $taxService;
        $this->shippingService = $shippingService;
    }

    /**
     * Get or create cart for user or session.
     */
    public function getCart(?int $userId, ?string $sessionId): Cart
    {
        if ($userId) {
            return $this->getOrCreateByUser($userId);
        }

        if ($sessionId) {
            return $this->findBySessionId($sessionId) ?? $this->cartRepository->create([
                'session_id' => $sessionId,
                'status' => 'active',
                'currency_code' => $this->config->get('currency.default', 'USD'),
                'locale' => $this->config->get('locale.default', 'en_US'),
            ]);
        }

        throw new \InvalidArgumentException(
            "Cart cannot be created without user_id or session_id. " .
            "Ensure X-Cart-Session header is sent from frontend."
        );
    }

    /**
     * Find cart by session ID.
     */
    public function findBySessionId(string $sessionId): ?Cart
    {
        return $this->cartRepository->findBySessionId($sessionId);
    }

    /**
     * Get or create cart for user.
     */
    public function getOrCreateByUser(int $userId): Cart
    {
        $cart = $this->cartRepository->findByUserId($userId);
        if (!$cart) {
            $cart = $this->cartRepository->create([
                'user_id' => $userId,
                'status' => 'active',
                'currency_code' => $this->config->get('currency.default', 'USD'),
                'locale' => $this->config->get('locale.default', 'en_US'),
            ]);
        }
        return $cart;
    }

    /**
     * Add item to cart.
     */
    public function addItem(Cart $cart, int $productId, int $quantity = 1, ?int $variantId = null, array $configuration = []): CartItem
    {
        $this->ensureCartIsActive($cart);

        // STRICT AUDIT: Variant ID is REQUIRED.
        if (!$variantId) {
             // COMPATIBILITY LAYER: Try to resolve Default Variant for "Simple Products"
             $product = Product::find($productId);
             if ($product) {
                 $defaultVariant = $product->variants->sortBy('sort_order')->first();
                 if ($defaultVariant) {
                     $variantId = $defaultVariant->id;
                     // Log::warning("Legacy Cart Add: Resolved default variant {$variantId} for Product {$productId}");
                 }
             }
             
             if (!$variantId) {
                 throw new InvalidArgumentException("A valid Product Variant ID is required to add items to cart.");
             }
        }

        $product = Product::findOrFail($productId);
        $variant = ProductVariant::findOrFail($variantId);
        
        // Ensure variant belongs to product
        if ($variant->product_id !== $product->id) {
            throw new InvalidArgumentException("Variant does not belong to the specified product.");
        }

        // Strict Quantity Validation
        $this->validateQuantity($quantity, $variant);

        // Fetch Unit Price from DB (Source of Truth: Variant)
        // Product price is deprecated/invalid
        $unitPrice = $variant->sale_price > 0 ? $variant->sale_price : $variant->price;

        // Sanitize configuration
        $configJson = !empty($configuration) ? json_encode($configuration) : null;

        $existingItem = $cart->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->first();

        if ($existingItem) {
             // Validate cumulative quantity
            $newQuantity = $existingItem->quantity + $quantity;
            $this->validateQuantity($newQuantity, $variant);

            $existingItem->quantity = $newQuantity;
            $existingItem->unit_price = $unitPrice; // Update price to current DB price on change
            $existingItem->configuration = $configuration; // Update config
            $existingItem->save();
            $item = $existingItem;
        } else {
            $item = $cart->items()->create([
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'configuration' => $configuration,
                'subtotal' => $quantity * $unitPrice,
                'total' => $quantity * $unitPrice,
            ]);
        }

        $this->recalculate($cart);
        
        $this->eventBus->dispatch(new ItemAdded($cart, $item));

        return $item;
    }

    /**
     * Update cart item quantity.
     */
    public function updateItem(CartItem $item, int $quantity): void
    {
        $this->ensureCartIsActive($item->cart);
        
        // Load relationships if missing
        if (!$item->relationLoaded('product')) $item->load('product');
        if (!$item->relationLoaded('variant')) $item->load('variant');

        if (!$item->variant) {
             // This is a data integrity issue (orphan item from before migration?)
             // We should probably delete it or error.
             throw new RuntimeException("Cart Item missing variant. Please remove and re-add.");
        }

        $this->validateQuantity($quantity, $item->variant);

        $item->update(['quantity' => $quantity]);
        $this->recalculate($item->cart);
        $this->eventBus->dispatch(new ItemAdded($item->cart, $item));
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(CartItem $item): void
    {
        $cart = $item->cart;
        $this->ensureCartIsActive($cart);

        $item->delete();
        $this->recalculate($cart);
        $this->eventBus->dispatch(new ItemRemoved($cart, $item));
    }

    /**
     * Clear cart.
     */
    public function clear(Cart $cart): void
    {
        $this->ensureCartIsActive($cart);

        $cart->items()->delete();
        $cart->coupon_id = null;
        $cart->discount = 0;
        $cart->subtotal = 0;
        $cart->total = 0;
        $cart->shipping_cost = 0; 
        $cart->save();
    }

    /**
     * Enforce Cart Locking Rule.
     */
    private function ensureCartIsActive(Cart $cart): void
    {
        if ($cart->status !== \App\Services\CartStateMachine::STATE_ACTIVE) {
            throw new RuntimeException("Cart is locked or already checked out. Modifications forbidden.");
        }
    }

    /**
     * Enforce Quantity Rules (Min 1, Max Stock).
     */
    private function validateQuantity(int $quantity, ProductVariant $variant): void
    {
        if ($quantity < 1) {
            throw new InvalidArgumentException("Quantity must be at least 1.");
        }

        $stock = $variant->stock_quantity;
        
        // If stock management is disabled (null), assume unlimited? Or strict?
        // Assuming strictly managed if field exists. If null, treat as 0 or unlimited depending on business logic. 
        // For 'Gold Standard', we assume strict stock.
        
        if ($stock !== null && $quantity > $stock) {
             throw new InvalidArgumentException("Requested quantity ({$quantity}) exceeds available stock ({$stock}).");
        }
    }


    /**
     * Finalize checkout (mark as checked_out).
     */
    public function finalizeCheckout(Cart $cart): void
    {
        app(\App\Services\CartStateMachine::class)->transition($cart, \App\Services\CartStateMachine::STATE_COMPLETED);
    }

    /**
     * Apply coupon to cart.
     */
    public function applyCoupon(Cart $cart, string $code): void
    {
        $this->ensureCartIsActive($cart);

        $coupon = \App\Models\Coupon::where('code', $code)
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            \Illuminate\Support\Facades\Log::info("Coupon failed: Not found", ['code' => $code]);
            throw new \InvalidArgumentException("This coupon code cannot be applied to your order.");
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            \Illuminate\Support\Facades\Log::info("Coupon failed: Expired", ['code' => $code]);
            throw new \InvalidArgumentException("This coupon code cannot be applied to your order.");
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            \Illuminate\Support\Facades\Log::info("Coupon failed: Usage Limit", ['code' => $code]);
            throw new \InvalidArgumentException("This coupon code cannot be applied to your order.");
        }

        if ($coupon->min_order_amount && $cart->subtotal < $coupon->min_order_amount) {
            \Illuminate\Support\Facades\Log::info("Coupon failed: Min Order Amount", ['code' => $code]);
            throw new \InvalidArgumentException("This coupon code cannot be applied to your order.");
        }

        $cart->coupon_id = $coupon->id;
        $cart->save();

        $this->recalculate($cart);
    }

    /**
     * Remove coupon from cart.
     */
    public function removeCoupon(Cart $cart): void
    {
        $this->ensureCartIsActive($cart);
        $cart->coupon_id = null;
        $cart->save();
        $this->recalculate($cart);
    }

    /**
     * Full Cart Recalculation Pipeline.
     */
    public function recalculate(Cart $cart): Cart
    {
        DB::beginTransaction();
        try {
            $priceChanges = [];
            
            // 1. VALIDATE & UPDATE PRICES FROM DATABASE
            // We must ensure that the prices in the cart match the current database prices.
            foreach ($cart->items as $item) {
                // Load product/variant with lock to ensure consistency during calculation
                // Note: We need the Variant price, NOT the product price.
                
                if (!$item->variant_id) {
                     // Invalid item (pre-migration?), remove it
                     $item->delete();
                     continue;
                }

                $variant = ProductVariant::find($item->variant_id);
                
                if (!$variant) {
                    $item->delete();
                    continue;
                }

                $currentPrice = $variant->sale_price > 0 ? $variant->sale_price : $variant->price;

                // Check for discrepancy (allow small float diff)
                if (abs($item->unit_price - $currentPrice) > 0.01) {
                    $priceChanges[] = [
                        'product' => $item->product->name . ' (' . $variant->sku . ')',
                        'old_price' => $item->unit_price,
                        'new_price' => $currentPrice
                    ];
                    
                    // Update to new price
                    $item->unit_price = $currentPrice;
                }

                $item->subtotal = $item->quantity * $item->unit_price;
                $item->total = $item->subtotal; // Pre-discount (PricingEngine calculates final total)
                $item->save();
            }

            if (!empty($priceChanges)) {
                // If we are in the middle of a checkout flow (e.g. triggered by CheckoutSessionManager),
                // this exception will halt the process and forcing the user to review changes.
                throw new \Core\Cart\Exceptions\PriceChangedException(
                    "Some prices have changed. Please review your cart.", 
                    $priceChanges
                );
            }

            // 2. Apply Pricing Rules (Discounts)
            $this->pricingEngine->applyRules($cart);

            // 3. Calculate Tax (if applicable)
            // Need address. If cart has address associated directly? 
            // Often cart doesn't have address until checkout.
            // But if user is logged in, use default?
            // For now, skip auto-tax unless context provided.
            
            // 4. Calculate Totals
            $subtotal = $cart->items->sum('subtotal');
            $discount = $cart->items->sum('discount_amount') + ($cart->discount_amount ?? 0); // Cart level discount?
            // PricingEngine handles cart->discount.

            $cart->subtotal = $subtotal;
            // $cart->total = ... handled by PricingEngine?
            // PricingEngine recalculatesTotals() at end.
            
            // If PricingEngine already saved, we are good.
            // But we might want to ensure consistency.
            
            $cart->save();
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return $cart;
    }

    /**
     * Merge guest cart into user cart.
     */
    public function merge(Cart $userCart, Cart $guestCart): void
    {
        foreach ($guestCart->items as $item) {
            // addItem now enforces variant_id, so this will fail if guestItem lacks it.
            // We assume guest items are valid or we skip them.
            if ($item->variant_id) {
                $this->addItem($userCart, $item->product_id, $item->quantity, $item->variant_id, $item->configuration ?? []);
            }
        }

        // Migrate coupon if set
        if ($guestCart->coupon_id && !$userCart->coupon_id) {
            $userCart->coupon_id = $guestCart->coupon_id;
            $userCart->save();
        }

        $guestCart->delete();
        $this->recalculate($userCart);
    }
}
