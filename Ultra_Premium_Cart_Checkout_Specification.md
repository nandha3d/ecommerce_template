# ULTRA-PREMIUM CART & CHECKOUT MODULE - AGENTIC IDE PROMPT

## SYSTEM ROLE
You are an expert full-stack developer building an enterprise-grade, ultra-premium cart and checkout system for an e-commerce platform. You will create a production-ready, scalable, and feature-rich implementation with ZERO hardcoded values.

## PROJECT CONTEXT
- **Backend:** Laravel 10 + PHP 8.2+
- **Frontend:** React 19 + TypeScript + Redux Toolkit
- **Database:** MySQL 8.0+
- **API:** RESTful with JWT authentication
- **Architecture:** Clean Architecture, Repository Pattern, Service Layer
- **State Management:** Redux with RTK Query
- **Styling:** Tailwind CSS 4.x

## CRITICAL CONSTRAINTS & RULES

### RULE 1: ZERO HARDCODED VALUES ⚠️
```
NEVER write:
❌ const TAX_RATE = 0.18;
❌ const SHIPPING_FEE = 50;
❌ if (country === 'US') { ... }
❌ const MIN_ORDER = 100;

ALWAYS use:
✅ const taxRate = await settingsService.get('tax_rate');
✅ const shipping = await shippingService.calculate(address, items);
✅ const country = address.country;
✅ const minOrder = await settingsService.get('min_order_amount');
```

### RULE 2: CONFIGURATION-DRIVEN ARCHITECTURE
All business logic must be driven by database configurations, not code constants.

### RULE 3: TYPE SAFETY
Every function, API response, and component must be fully typed with TypeScript/PHP types.

### RULE 4: ERROR HANDLING
Implement comprehensive error handling with graceful degradation.

### RULE 5: PERFORMANCE
- Implement optimistic updates
- Use lazy loading
- Cache aggressively
- Minimize re-renders

### RULE 6: ACCESSIBILITY
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- ARIA labels

### RULE 7: SECURITY
- Input validation
- XSS prevention
- CSRF protection
- Rate limiting
- PCI compliance for payments

### RULE 8: TESTABILITY
Every service, component, and API must be unit testable.

---

## PART 1: DATABASE SCHEMA DESIGN

### INSTRUCTION SET 1.1: Core Tables

Create the following tables with proper relationships:

#### Table: `site_settings`
```sql
Purpose: Store all configurable values (NO HARDCODING)
Columns:
- id: bigint primary key
- key: string unique indexed (e.g., 'cart.max_items', 'tax.rate.default')
- value: json (supports string, number, boolean, array, object)
- type: enum('string', 'number', 'boolean', 'json', 'encrypted')
- category: string (e.g., 'cart', 'checkout', 'payment', 'shipping')
- description: text
- is_public: boolean (can frontend access?)
- updated_by: bigint nullable (admin who updated)
- created_at, updated_at
```

#### Table: `carts`
```sql
Purpose: Store cart sessions
Columns:
- id: bigint primary key
- user_id: bigint nullable indexed
- session_id: string nullable unique indexed
- currency_code: char(3) default 'USD'
- locale: string default 'en_US'
- ip_address: string nullable
- user_agent: text nullable
- expires_at: timestamp
- metadata: json (store any dynamic data)
- created_at, updated_at
Indexes:
- index on (user_id, created_at)
- index on (session_id, expires_at)
- index on expires_at
```

#### Table: `cart_items`
```sql
Purpose: Items in cart
Columns:
- id: bigint primary key
- cart_id: bigint foreign key cascade
- product_id: bigint foreign key
- variant_id: bigint nullable foreign key
- quantity: integer unsigned
- unit_price: decimal(10,2)
- sale_price: decimal(10,2) nullable
- tax_amount: decimal(10,2) default 0
- discount_amount: decimal(10,2) default 0
- subtotal: decimal(10,2)
- total: decimal(10,2)
- configuration: json (variant options, customizations)
- added_at: timestamp
- updated_at: timestamp
Indexes:
- unique (cart_id, product_id, variant_id, configuration hash)
```

#### Table: `cart_pricing_rules`
```sql
Purpose: Dynamic pricing rules (quantity discounts, bundle pricing, etc.)
Columns:
- id: bigint primary key
- name: string
- description: text
- type: enum('quantity_discount', 'bundle', 'bogo', 'category', 'user_segment')
- conditions: json (when to apply)
- actions: json (what discount to apply)
- priority: integer (higher = applies first)
- is_active: boolean
- starts_at: timestamp nullable
- ends_at: timestamp nullable
- usage_limit: integer nullable
- usage_count: integer default 0
- created_at, updated_at
```

#### Table: `shipping_methods`
```sql
Purpose: Available shipping options
Columns:
- id: bigint primary key
- code: string unique (e.g., 'standard', 'express', 'same_day')
- name: string
- description: text
- type: enum('flat_rate', 'weight_based', 'price_based', 'carrier_api', 'free')
- carrier: string nullable (e.g., 'fedex', 'ups', 'usps')
- pricing_config: json (rules for calculation)
- delivery_days_min: integer
- delivery_days_max: integer
- countries: json array (allowed countries)
- excluded_countries: json array
- min_order_amount: decimal(10,2) nullable
- max_order_amount: decimal(10,2) nullable
- max_weight: decimal(10,2) nullable
- is_active: boolean
- sort_order: integer
- created_at, updated_at
```

#### Table: `tax_rules`
```sql
Purpose: Tax calculation rules by location/product
Columns:
- id: bigint primary key
- name: string
- country_code: char(2)
- state_code: string nullable
- city: string nullable
- zip_code: string nullable
- tax_rate: decimal(5,4) (e.g., 0.0825 for 8.25%)
- compound: boolean (tax on tax?)
- applies_to: enum('all', 'physical', 'digital', 'specific_categories')
- category_ids: json nullable
- priority: integer
- is_active: boolean
- created_at, updated_at
```

#### Table: `payment_methods`
```sql
Purpose: Configured payment gateways
Columns:
- id: bigint primary key
- code: string unique (e.g., 'razorpay', 'stripe', 'paypal')
- name: string
- description: text
- gateway_class: string (PHP class name)
- config: json encrypted (API keys, secrets)
- supported_currencies: json array
- countries: json array (allowed countries)
- min_amount: decimal(10,2) nullable
- max_amount: decimal(10,2) nullable
- transaction_fee_type: enum('fixed', 'percentage', 'mixed')
- transaction_fee_value: decimal(10,4)
- is_active: boolean
- sort_order: integer
- created_at, updated_at
```

#### Table: `checkout_sessions`
```sql
Purpose: Track checkout progress
Columns:
- id: bigint primary key
- cart_id: bigint foreign key cascade
- user_id: bigint nullable
- step: enum('cart', 'address', 'shipping', 'payment', 'review', 'processing', 'complete')
- shipping_address_id: bigint nullable
- billing_address_id: bigint nullable
- shipping_method_id: bigint nullable
- payment_method_id: bigint nullable
- data: json (form data, validations, etc.)
- started_at: timestamp
- completed_at: timestamp nullable
- abandoned_at: timestamp nullable
- expires_at: timestamp
- created_at, updated_at
```

#### Table: `orders`
```sql
Purpose: Completed orders
Columns:
- id: bigint primary key
- order_number: string unique indexed
- user_id: bigint nullable indexed
- cart_id: bigint nullable
- checkout_session_id: bigint nullable
- status: enum('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')
- payment_status: enum('pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded')
- fulfillment_status: enum('unfulfilled', 'partial', 'fulfilled', 'returned')
- currency_code: char(3)
- subtotal: decimal(10,2)
- tax_amount: decimal(10,2)
- shipping_amount: decimal(10,2)
- discount_amount: decimal(10,2)
- total_amount: decimal(10,2)
- shipping_address: json
- billing_address: json
- shipping_method: json
- payment_method: json
- notes: text nullable
- metadata: json
- placed_at: timestamp
- confirmed_at: timestamp nullable
- shipped_at: timestamp nullable
- delivered_at: timestamp nullable
- cancelled_at: timestamp nullable
- created_at, updated_at
```

#### Table: `order_items`
```sql
Purpose: Items in an order
Columns:
- id: bigint primary key
- order_id: bigint foreign key cascade
- product_id: bigint
- variant_id: bigint nullable
- sku: string
- name: string
- variant_name: string nullable
- quantity: integer unsigned
- unit_price: decimal(10,2)
- tax_amount: decimal(10,2)
- discount_amount: decimal(10,2)
- subtotal: decimal(10,2)
- total: decimal(10,2)
- configuration: json
- fulfillment_status: enum('unfulfilled', 'fulfilled', 'returned')
- created_at, updated_at
```

#### Table: `abandoned_carts`
```sql
Purpose: Track abandoned carts for recovery
Columns:
- id: bigint primary key
- cart_id: bigint foreign key
- user_id: bigint nullable
- email: string nullable
- phone: string nullable
- cart_value: decimal(10,2)
- items_count: integer
- recovery_status: enum('pending', 'email_sent', 'recovered', 'expired')
- recovery_token: string unique nullable
- abandoned_at: timestamp
- first_reminder_sent_at: timestamp nullable
- second_reminder_sent_at: timestamp nullable
- recovered_at: timestamp nullable
- created_at, updated_at
```

#### Table: `cart_recovery_templates`
```sql
Purpose: Email templates for cart recovery
Columns:
- id: bigint primary key
- name: string
- trigger_hours: integer (hours after abandonment)
- subject: string
- body_html: text
- body_text: text
- discount_type: enum('none', 'percentage', 'fixed') nullable
- discount_value: decimal(10,2) nullable
- is_active: boolean
- created_at, updated_at
```

---

### INSTRUCTION SET 1.2: Advanced Tables

#### Table: `cart_validations`
```sql
Purpose: Store validation results for cart/checkout
Columns:
- id: bigint primary key
- cart_id: bigint foreign key
- validation_type: string (e.g., 'stock', 'price', 'shipping', 'payment')
- is_valid: boolean
- errors: json array
- warnings: json array
- checked_at: timestamp
- expires_at: timestamp
```

#### Table: `price_snapshots`
```sql
Purpose: Track price changes during checkout
Columns:
- id: bigint primary key
- cart_item_id: bigint foreign key
- product_id: bigint
- variant_id: bigint nullable
- price_at_add: decimal(10,2)
- price_current: decimal(10,2)
- changed_at: timestamp
- notified: boolean default false
```

#### Table: `shipping_rates_cache`
```sql
Purpose: Cache carrier API responses
Columns:
- id: bigint primary key
- cache_key: string unique (hash of request params)
- carrier: string
- request_data: json
- rates: json
- expires_at: timestamp
- created_at: timestamp
```

---

## PART 2: BACKEND IMPLEMENTATION

### INSTRUCTION SET 2.1: Configuration Service

Create `app/Services/ConfigurationService.php`:

**Requirements:**
1. Retrieve settings from `site_settings` table
2. Support nested keys with dot notation (e.g., 'cart.max_items')
3. Cache settings in Redis with TTL
4. Type conversion based on setting type
5. Default values if setting not found
6. Public/private setting distinction

**Interface:**
```php
interface ConfigurationServiceInterface
{
    public function get(string $key, mixed $default = null): mixed;
    public function getInt(string $key, int $default = 0): int;
    public function getFloat(string $key, float $default = 0.0): float;
    public function getBool(string $key, bool $default = false): bool;
    public function getArray(string $key, array $default = []): array;
    public function set(string $key, mixed $value, string $type = 'string'): void;
    public function invalidateCache(string $key): void;
    public function getPublicSettings(): array;
}
```

**Cache Strategy:**
- Cache individual settings: TTL 1 hour
- Cache public settings bundle: TTL 5 minutes
- Invalidate on update

---

### INSTRUCTION SET 2.2: Cart Service (Enhanced)

Create `app/Services/Cart/CartService.php`:

**Requirements:**
1. Session management (guest + authenticated)
2. Item CRUD operations
3. Quantity validation against stock
4. Price validation and updates
5. Automatic pricing rule application
6. Tax calculation
7. Shipping cost calculation
8. Discount application
9. Cart validation
10. Cart expiration handling
11. Cart merging (guest → user)

**Methods to Implement:**

```php
class CartService
{
    // Core operations
    public function getOrCreate(string $sessionId = null, ?int $userId = null): Cart;
    public function addItem(Cart $cart, int $productId, int $quantity = 1, ?int $variantId = null, array $config = []): CartItem;
    public function updateQuantity(CartItem $item, int $quantity): CartItem;
    public function removeItem(CartItem $item): void;
    public function clear(Cart $cart): void;
    
    // Validation
    public function validate(Cart $cart): ValidationResult;
    public function validateStock(Cart $cart): ValidationResult;
    public function validatePrices(Cart $cart): ValidationResult;
    public function validateShipping(Cart $cart, ?Address $address = null): ValidationResult;
    
    // Pricing
    public function recalculate(Cart $cart): Cart;
    public function applyPricingRules(Cart $cart): Cart;
    public function calculateTax(Cart $cart, Address $address): float;
    public function calculateShipping(Cart $cart, Address $address, ShippingMethod $method): float;
    public function applyDiscount(Cart $cart, string $couponCode): Cart;
    
    // Lifecycle
    public function merge(Cart $destination, Cart $source): Cart;
    public function abandon(Cart $cart): AbandonedCart;
    public function recover(string $recoveryToken): ?Cart;
    public function cleanExpired(): int;
}
```

**Business Rules (from config):**
```php
// Get all rules from configuration
$maxItems = $this->config->getInt('cart.max_items', 100);
$maxQuantityPerItem = $this->config->getInt('cart.max_quantity_per_item', 10);
$sessionTTL = $this->config->getInt('cart.session_ttl_hours', 24);
$allowBackorders = $this->config->getBool('cart.allow_backorders', false);
```

---

### INSTRUCTION SET 2.3: Pricing Engine Service

Create `app/Services/Cart/PricingEngineService.php`:

**Requirements:**
1. Rule-based pricing (from database)
2. Quantity discounts
3. Buy-one-get-one (BOGO)
4. Bundle pricing
5. User segment pricing
6. Category-based discounts
7. Time-based pricing
8. Priority and conflict resolution

**Rule Evaluation Flow:**
```php
class PricingEngineService
{
    public function applyRules(Cart $cart): Cart;
    public function evaluateRule(CartPricingRule $rule, Cart $cart): ?PriceAdjustment;
    public function canApplyRule(CartPricingRule $rule, Cart $cart): bool;
    public function calculateDiscount(CartPricingRule $rule, CartItem $item): float;
    public function resolveConflicts(array $applicableRules): array;
}
```

**Rule Examples (stored in DB):**

```json
// Quantity Discount Rule
{
  "type": "quantity_discount",
  "conditions": {
    "product_id": 123,
    "min_quantity": 5
  },
  "actions": {
    "discount_type": "percentage",
    "discount_value": 10
  }
}

// Bundle Rule
{
  "type": "bundle",
  "conditions": {
    "product_ids": [101, 102, 103],
    "require_all": true
  },
  "actions": {
    "discount_type": "fixed",
    "discount_value": 500,
    "apply_to": "bundle_total"
  }
}
```

---

### INSTRUCTION SET 2.4: Tax Calculation Service

Create `app/Services/Cart/TaxCalculationService.php`:

**Requirements:**
1. Location-based tax (country, state, city, zip)
2. Product category tax exemptions
3. Compound tax support
4. Priority-based rule application
5. Tax-inclusive vs tax-exclusive pricing

**Methods:**
```php
class TaxCalculationService
{
    public function calculate(Cart $cart, Address $address): TaxBreakdown;
    public function getApplicableRules(Address $address, array $categoryIds): Collection;
    public function calculateItemTax(CartItem $item, TaxRule $rule): float;
    public function isExempt(CartItem $item, TaxRule $rule): bool;
}
```

**Tax Breakdown Structure:**
```php
class TaxBreakdown
{
    public float $subtotal;
    public float $taxableAmount;
    public float $taxAmount;
    public array $breakdown; // per rule
    public bool $isInclusive;
}
```

---

### INSTRUCTION SET 2.5: Shipping Calculation Service

Create `app/Services/Cart/ShippingCalculationService.php`:

**Requirements:**
1. Multiple method support (flat, weight, price, carrier API)
2. Real-time carrier rates (FedEx, UPS, USPS)
3. Free shipping rules
4. Location-based availability
5. Delivery time estimates
6. Rate caching

**Methods:**
```php
class ShippingCalculationService
{
    public function getAvailableMethods(Cart $cart, Address $address): Collection;
    public function calculateRate(ShippingMethod $method, Cart $cart, Address $address): ShippingRate;
    public function fetchCarrierRates(string $carrier, Cart $cart, Address $address): array;
    public function cacheRate(string $cacheKey, array $rates, int $ttl = 3600): void;
    public function isFreeShippingEligible(Cart $cart, ShippingMethod $method): bool;
}
```

**Carrier Integration:**
```php
interface ShippingCarrierInterface
{
    public function getRates(ShippingRequest $request): ShippingResponse;
    public function validateAddress(Address $address): AddressValidationResult;
    public function createShipment(Order $order): Shipment;
    public function trackShipment(string $trackingNumber): TrackingInfo;
}
```

---

### INSTRUCTION SET 2.6: Checkout Session Manager

Create `app/Services/Checkout/CheckoutSessionManager.php`:

**Requirements:**
1. Multi-step checkout state management
2. Step validation
3. Progress tracking
4. Session persistence
5. Abandonment detection
6. Session recovery

**Methods:**
```php
class CheckoutSessionManager
{
    public function start(Cart $cart): CheckoutSession;
    public function saveStep(CheckoutSession $session, string $step, array $data): CheckoutSession;
    public function validateStep(CheckoutSession $session, string $step): ValidationResult;
    public function canProceed(CheckoutSession $session, string $toStep): bool;
    public function complete(CheckoutSession $session): Order;
    public function abandon(CheckoutSession $session): AbandonedCart;
}
```

**Checkout Steps Flow:**
```
1. Cart Review → validate cart
2. Customer Info → validate email/phone
3. Shipping Address → validate address, get shipping methods
4. Shipping Method → validate selection, calculate final pricing
5. Payment Method → validate payment method availability
6. Review & Confirm → final validation
7. Payment Processing → process payment
8. Order Confirmation → create order, clear cart
```

---

### INSTRUCTION SET 2.7: Payment Gateway Abstraction

Create `app/Services/Payment/PaymentGatewayInterface.php`:

**Requirements:**
1. Gateway abstraction layer
2. Multiple gateway support
3. Dynamic configuration
4. Transaction logging
5. Webhook handling
6. Refund support

**Interface:**
```php
interface PaymentGatewayInterface
{
    public function getName(): string;
    public function initialize(array $config): void;
    public function createPaymentIntent(Order $order): PaymentIntent;
    public function authorizePayment(string $paymentId, array $paymentData): PaymentResult;
    public function capturePayment(string $paymentId, float $amount): PaymentResult;
    public function refundPayment(string $paymentId, float $amount): PaymentResult;
    public function verifyWebhook(Request $request): WebhookEvent;
    public function getSupportedCurrencies(): array;
    public function getMinAmount(string $currency): float;
    public function getMaxAmount(string $currency): float;
}
```

**Gateway Implementations:**
- `RazorpayGateway.php`
- `StripeGateway.php`
- `PayPalGateway.php`
- `SquareGateway.php`

---

### INSTRUCTION SET 2.8: Order Processing Pipeline

Create `app/Services/Order/OrderProcessingPipeline.php`:

**Requirements:**
1. Multi-stage order processing
2. Transaction safety
3. Event emission
4. Rollback capability
5. Async processing support

**Pipeline Stages:**
```php
class OrderProcessingPipeline
{
    public function process(CheckoutSession $session, array $paymentData): Order;
    
    protected function stages(): array
    {
        return [
            ValidateCheckoutStage::class,
            ReserveInventoryStage::class,
            ProcessPaymentStage::class,
            CreateOrderStage::class,
            SendConfirmationStage::class,
            ClearCartStage::class,
            TriggerFulfillmentStage::class,
        ];
    }
}
```

**Stage Interface:**
```php
interface PipelineStageInterface
{
    public function execute(OrderContext $context): OrderContext;
    public function rollback(OrderContext $context): void;
    public function canExecute(OrderContext $context): bool;
}
```

---

### INSTRUCTION SET 2.9: Cart Validation Service

Create `app/Services/Cart/CartValidationService.php`:

**Requirements:**
1. Comprehensive validation
2. Real-time validation
3. Validation caching
4. Error categorization (errors vs warnings)

**Validation Checks:**
```php
class CartValidationService
{
    // Stock validation
    public function validateStock(Cart $cart): ValidationResult;
    
    // Price validation
    public function validatePrices(Cart $cart): ValidationResult;
    
    // Shipping validation
    public function validateShipping(Cart $cart, ?Address $address): ValidationResult;
    
    // Payment validation
    public function validatePayment(Cart $cart, PaymentMethod $method): ValidationResult;
    
    // Business rules validation
    public function validateBusinessRules(Cart $cart): ValidationResult;
    
    // Comprehensive validation
    public function validateAll(Cart $cart, CheckoutSession $session): ValidationResult;
}
```

**Validation Result:**
```php
class ValidationResult
{
    public bool $isValid;
    public array $errors = [];
    public array $warnings = [];
    public array $info = [];
    
    public function addError(string $field, string $message): void;
    public function addWarning(string $field, string $message): void;
    public function hasErrors(): bool;
    public function getErrorsFor(string $field): array;
}
```

---

### INSTRUCTION SET 2.10: API Controllers

Create comprehensive API controllers:

#### `CartController.php`
```php
class CartController extends Controller
{
    // GET /api/v1/cart
    public function show(Request $request): JsonResponse;
    
    // POST /api/v1/cart/items
    public function addItem(AddToCartRequest $request): JsonResponse;
    
    // PUT /api/v1/cart/items/{itemId}
    public function updateItem(int $itemId, UpdateCartItemRequest $request): JsonResponse;
    
    // DELETE /api/v1/cart/items/{itemId}
    public function removeItem(int $itemId): JsonResponse;
    
    // POST /api/v1/cart/validate
    public function validate(Request $request): JsonResponse;
    
    // POST /api/v1/cart/coupon
    public function applyCoupon(ApplyCouponRequest $request): JsonResponse;
    
    // DELETE /api/v1/cart/coupon
    public function removeCoupon(): JsonResponse;
    
    // GET /api/v1/cart/summary
    public function summary(Request $request): JsonResponse;
}
```

#### `CheckoutController.php`
```php
class CheckoutController extends Controller
{
    // POST /api/v1/checkout/start
    public function start(Request $request): JsonResponse;
    
    // GET /api/v1/checkout/session
    public function getSession(Request $request): JsonResponse;
    
    // POST /api/v1/checkout/step/{step}
    public function saveStep(string $step, Request $request): JsonResponse;
    
    // GET /api/v1/checkout/shipping-methods
    public function getShippingMethods(Request $request): JsonResponse;
    
    // GET /api/v1/checkout/payment-methods
    public function getPaymentMethods(Request $request): JsonResponse;
    
    // POST /api/v1/checkout/validate/{step}
    public function validateStep(string $step, Request $request): JsonResponse;
    
    // POST /api/v1/checkout/complete
    public function complete(CompleteCheckoutRequest $request): JsonResponse;
}
```

#### `PaymentController.php`
```php
class PaymentController extends Controller
{
    // POST /api/v1/payment/initialize
    public function initialize(InitializePaymentRequest $request): JsonResponse;
    
    // POST /api/v1/payment/verify
    public function verify(VerifyPaymentRequest $request): JsonResponse;
    
    // POST /api/v1/payment/webhook/{gateway}
    public function webhook(string $gateway, Request $request): JsonResponse;
    
    // POST /api/v1/payment/retry/{orderId}
    public function retry(int $orderId, Request $request): JsonResponse;
}
```

---

## PART 3: FRONTEND IMPLEMENTATION

### INSTRUCTION SET 3.1: Redux Store Structure

Create comprehensive Redux slices:

#### `cartSlice.ts`
```typescript
interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    isSyncing: boolean;
    error: string | null;
    validationResult: ValidationResult | null;
    lastSync: number | null;
    optimisticUpdates: Record<string, any>;
}

// Actions
- fetchCart
- addToCart (optimistic)
- updateQuantity (optimistic)
- removeItem (optimistic)
- applyCoupon
- removeCoupon
- validateCart
- syncCart
- clearCart
```

#### `checkoutSlice.ts`
```typescript
interface CheckoutState {
    session: CheckoutSession | null;
    currentStep: CheckoutStep;
    completedSteps: CheckoutStep[];
    stepData: Record<CheckoutStep, any>;
    shippingMethods: ShippingMethod[];
    paymentMethods: PaymentMethod[];
    isProcessing: boolean;
    error: string | null;
}

// Actions
- startCheckout
- saveStepData
- validateStep
- setStep
- fetchShippingMethods
- fetchPaymentMethods
- completeCheckout
```

#### `configSlice.ts`
```typescript
interface ConfigState {
    settings: Record<string, any>;
    isLoaded: boolean;
    currency: string;
    locale: string;
}

// Actions
- fetchPublicSettings
- setCurrency
- setLocale
```

---

### INSTRUCTION SET 3.2: RTK Query API Slices

Create API slices for data fetching:

#### `cartApi.ts`
```typescript
export const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: '/api/v1',
        prepareHeaders: (headers) => {
            // Add auth token
            // Add cart session
            return headers;
        }
    }),
    tagTypes: ['Cart', 'CartValidation'],
    endpoints: (builder) => ({
        getCart: builder.query<Cart, void>({
            query: () => '/cart',
            providesTags: ['Cart']
        }),
        addItem: builder.mutation<Cart, AddToCartPayload>({
            query: (payload) => ({
                url: '/cart/items',
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['Cart', 'CartValidation']
        }),
        // ... more endpoints
    })
});
```

---

### INSTRUCTION SET 3.3: Cart Components

Create modular, reusable components:

#### Component Tree
```
CartPage
├── CartHeader
│   └── CartItemCount
├── CartItemList
│   └── CartItem
│       ├── ProductImage
│       ├── ProductInfo
│       ├── QuantitySelector
│       ├── PriceDisplay
│       └── RemoveButton
├── CartSummary
│   ├── SubtotalRow
│   ├── TaxRow
│   ├── ShippingRow
│   ├── DiscountRow
│   └── TotalRow
├── CouponForm
└── CartActions
    ├── ContinueShopping
    └── ProceedToCheckout
```

#### CartItem Component Requirements
```typescript
interface CartItemProps {
    item: CartItem;
    onUpdateQuantity: (itemId: number, quantity: number) => void;
    onRemove: (itemId: number) => void;
    isUpdating: boolean;
    showConfiguration: boolean;
}

Requirements:
- Optimistic updates
- Loading states
- Error handling
- Price change notifications
- Stock warnings
- Image lazy loading
- Accessibility (ARIA labels)
```

#### CartSummary Component Requirements
```typescript
interface CartSummaryProps {
    cart: Cart;
    showBreakdown: boolean;
    highlightSavings: boolean;
}

Requirements:
- Dynamic currency formatting
- Tax breakdown on hover
- Shipping estimate link
- Discount code display
- Responsive design
- Loading skeleton
```

---

### INSTRUCTION SET 3.4: Checkout Flow Components

Create multi-step checkout:

#### Component Tree
```
CheckoutPage
├── CheckoutHeader
│   └── CheckoutProgressBar
├── CheckoutSteps
│   ├── CustomerInfoStep
│   ├── ShippingAddressStep
│   ├── ShippingMethodStep
│   ├── PaymentMethodStep
│   └── ReviewStep
├── CheckoutSidebar
│   ├── OrderSummary
│   └── SecurityBadges
└── CheckoutFooter
    ├── BackButton
    ├── ContinueButton
    └── SecureCheckoutBadge
```

#### Step Component Requirements

**CustomerInfoStep:**
```typescript
Requirements:
- Email validation (real-time)
- Phone validation
- Guest vs account creation
- Auto-save on blur
- Field-level errors
- Continue as guest option
```

**ShippingAddressStep:**
```typescript
Requirements:
- Address autocomplete (Google Places)
- Address validation
- Save address option
- Multiple addresses support
- Default address selection
- Manual entry fallback
- Country/state dropdowns (from config)
```

**ShippingMethodStep:**
```typescript
Requirements:
- Display all available methods
- Delivery date estimates
- Price comparison
- Default selection (cheapest/fastest)
- Carrier logos
- Tracking info preview
```

**PaymentMethodStep:**
```typescript
Requirements:
- Multiple gateway support
- Card form (Stripe Elements, Razorpay)
- Saved cards support
- Billing address (same/different)
- Security badges (PCI, SSL)
- CVV tooltip
```

**ReviewStep:**
```typescript
Requirements:
- Order summary
- Editable sections
- Terms & conditions checkbox
- Final price confirmation
- Place order button
- Processing indicator
```

---

### INSTRUCTION SET 3.5: Advanced Features

#### Feature: Cart Drawer (Slide-in)
```typescript
Requirements:
- Slide from right
- Smooth animations (Framer Motion)
- Click outside to close
- ESC key to close
- Mini cart items (max 3, show more)
- Quick checkout button
- View full cart link
- Empty state
- Loading state
```

#### Feature: Quantity Selector
```typescript
Requirements:
- Increment/decrement buttons
- Direct input
- Min/max validation (from config)
- Stock limit enforcement
- Debounced updates
- Loading state per item
- Optimistic updates
```

#### Feature: Price Display
```typescript
Requirements:
- Dynamic currency (from config)
- Sale price highlighting
- Discount badge
- Savings calculation
- Price change notification
- Tax-inclusive/exclusive display
```

#### Feature: Coupon/Promo Code
```typescript
Requirements:
- Inline validation
- Success/error messages
- Applied discount display
- Remove coupon option
- Multiple coupons support (if config allows)
- Auto-apply from URL param
```

#### Feature: Cart Validation Alerts
```typescript
Requirements:
- Stock warnings
- Price changes
- Item unavailable
- Shipping restrictions
- Minimum order amount
- Maximum order amount
- Dismissible alerts
```

#### Feature: Shipping Calculator
```typescript
Requirements:
- Zip code input
- Quick estimate
- Display methods
- Modal/inline options
- Cache results
- Error handling
```

#### Feature: Abandoned Cart Recovery
```typescript
Requirements:
- Track abandonment
- Save cart state
- Recovery email
- Recovery URL with token
- Re-populate cart
- Discount incentive (from config)
```

---

### INSTRUCTION SET 3.6: Optimistic Updates Pattern

Implement optimistic updates for better UX:

```typescript
// Example: Add to Cart Optimistic Update
const addToCart = async (productId: number, quantity: number) => {
    // 1. Create optimistic cart item
    const optimisticItem = {
        id: `temp-${Date.now()}`,
        product_id: productId,
        quantity,
        // ... estimated values
    };
    
    // 2. Update UI immediately
    dispatch(addOptimisticItem(optimisticItem));
    
    try {
        // 3. Make API call
        const result = await cartApi.addItem({ productId, quantity });
        
        // 4. Replace optimistic with real data
        dispatch(replaceOptimisticItem(optimisticItem.id, result));
    } catch (error) {
        // 5. Rollback on error
        dispatch(removeOptimisticItem(optimisticItem.id));
        dispatch(showError(error.message));
    }
};
```

---

### INSTRUCTION SET 3.7: Error Handling Strategy

Implement comprehensive error handling:

#### Error Types
```typescript
enum ErrorType {
    NETWORK = 'network',
    VALIDATION = 'validation',
    BUSINESS_RULE = 'business_rule',
    STOCK = 'stock',
    PAYMENT = 'payment',
    SERVER = 'server',
    UNKNOWN = 'unknown'
}

interface AppError {
    type: ErrorType;
    message: string;
    field?: string;
    code?: string;
    retryable: boolean;
    action?: ErrorAction;
}
```

#### Error Actions
```typescript
interface ErrorAction {
    label: string;
    handler: () => void;
}

// Examples:
- Retry Payment
- Update Address
- Remove Item
- Contact Support
- Go to Product Page
```

#### Error Display Components
```typescript
- ErrorBoundary (global)
- InlineError (field-level)
- ToastError (transient)
- ModalError (critical)
- BannerError (cart/checkout-wide)
```

---

### INSTRUCTION SET 3.8: Loading States

Implement skeleton loaders and loading states:

#### Skeleton Components
```typescript
- CartSkeleton
- CartItemSkeleton
- CheckoutStepSkeleton
- ShippingMethodSkeleton
- PaymentFormSkeleton
```

#### Loading Indicators
```typescript
- Global spinner (full-page)
- Button spinner (inline)
- Item spinner (per cart item)
- Progress bar (checkout steps)
- Shimmer effect (skeletons)
```

---

### INSTRUCTION SET 3.9: Analytics & Tracking

Implement comprehensive tracking:

#### Events to Track
```typescript
// Cart Events
- cart.item_added
- cart.item_removed
- cart.item_quantity_changed
- cart.coupon_applied
- cart.validated
- cart.abandoned

// Checkout Events
- checkout.started
- checkout.step_completed
- checkout.step_failed
- checkout.shipping_method_selected
- checkout.payment_method_selected
- checkout.completed

// Payment Events
- payment.initiated
- payment.authorized
- payment.failed
- payment.completed
```

#### Analytics Service
```typescript
interface AnalyticsService {
    track(event: string, properties: Record<string, any>): void;
    identify(userId: string, traits: Record<string, any>): void;
    page(name: string, properties: Record<string, any>): void;
}

// Integrations:
- Google Analytics 4
- Facebook Pixel
- Segment
- Mixpanel
- Custom backend tracking
```

---

### INSTRUCTION SET 3.10: Performance Optimization

Implement performance best practices:

#### Code Splitting
```typescript
// Lazy load checkout components
const CheckoutPage = lazy(() => import('./features/checkout/CheckoutPage'));
const PaymentForm = lazy(() => import('./components/PaymentForm'));
```

#### Memoization
```typescript
// Memoize expensive calculations
const totalPrice = useMemo(() => 
    calculateTotal(cart.items, taxRate, shippingCost),
    [cart.items, taxRate, shippingCost]
);

// Memoize components
const CartItem = React.memo(CartItemComponent);
```

#### Virtualization
```typescript
// For large cart item lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
    height={600}
    itemCount={cart.items.length}
    itemSize={120}
>
    {({ index, style }) => (
        <CartItem item={cart.items[index]} style={style} />
    )}
</FixedSizeList>
```

#### Image Optimization
```typescript
// Lazy load images
<img 
    loading="lazy" 
    src={product.image} 
    srcSet={`${product.image_small} 300w, ${product.image_large} 600w`}
/>
```

---

## PART 4: ADVANCED FEATURES

### INSTRUCTION SET 4.1: Multi-Currency Support

**Requirements:**
1. Currency selection
2. Real-time conversion
3. Display in selected currency
4. Checkout in original currency
5. Exchange rate updates

**Implementation:**
```typescript
// Frontend
const useCurrency = () => {
    const selectedCurrency = useSelector(state => state.config.currency);
    const exchangeRates = useSelector(state => state.config.exchangeRates);
    
    const convert = (amount: number, from: string, to: string) => {
        // Conversion logic
    };
    
    const format = (amount: number, currency: string) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
        }).format(amount);
    };
    
    return { convert, format, selectedCurrency };
};
```

**Backend:**
```php
// Scheduled job to update rates
class UpdateExchangeRates implements ShouldQueue
{
    public function handle()
    {
        $rates = $this->fetchRatesFromAPI();
        
        foreach ($rates as $currency => $rate) {
            $this->config->set("exchange_rates.{$currency}", $rate);
        }
    }
}
```

---

### INSTRUCTION SET 4.2: Save for Later / Wishlist Integration

**Requirements:**
1. Move items from cart to wishlist
2. Move items from wishlist to cart
3. Sync across devices
4. Stock notifications for wishlist items

**Implementation:**
```typescript
interface WishlistService {
    moveFromCart(itemId: number): Promise<void>;
    moveToCart(wishlistItemId: number): Promise<Cart>;
    notifyWhenInStock(productId: number): Promise<void>;
}
```

---

### INSTRUCTION SET 4.3: Guest Checkout

**Requirements:**
1. Checkout without account
2. Email verification
3. Order tracking by email + order number
4. Post-checkout account creation option

**Flow:**
```
1. Guest enters email
2. Email validation (not duplicate)
3. Complete checkout
4. Send order confirmation with tracking link
5. Offer account creation (one-click)
```

---

### INSTRUCTION SET 4.4: Express Checkout

**Requirements:**
1. One-click checkout
2. Saved addresses
3. Saved payment methods
4. Skip intermediate steps

**Implementation:**
```typescript
const ExpressCheckout = () => {
    const handleExpressCheckout = async () => {
        // Use default address
        // Use default payment
        // Process immediately
    };
};
```

---

### INSTRUCTION SET 4.5: Buy Now Pay Later (BNPL)

**Requirements:**
1. Installment calculation
2. Gateway integration (Klarna, Afterpay, Affirm)
3. Eligibility check
4. Display monthly payment

**Implementation:**
```php
interface BNPLGatewayInterface extends PaymentGatewayInterface
{
    public function calculateInstallments(float $amount, string $currency): array;
    public function checkEligibility(Order $order): bool;
    public function getTerms(): array;
}
```

---

### INSTRUCTION SET 4.6: Subscription Support

**Requirements:**
1. Recurring product option
2. Subscription frequency selection
3. Subscription management
4. Auto-billing

**Database:**
```sql
CREATE TABLE subscriptions (
    id bigint primary key,
    user_id bigint,
    product_id bigint,
    variant_id bigint nullable,
    quantity integer,
    frequency enum('weekly', 'biweekly', 'monthly'),
    status enum('active', 'paused', 'cancelled'),
    next_billing_date date,
    created_at timestamp,
    updated_at timestamp
);
```

---

### INSTRUCTION SET 4.7: Gift Options

**Requirements:**
1. Gift wrap option
2. Gift message
3. Hide prices
4. Gift receipt

**Implementation:**
```typescript
interface GiftOptions {
    isGift: boolean;
    giftWrap: boolean;
    giftMessage: string;
    hidePrices: boolean;
    recipientEmail?: string;
}
```

---

### INSTRUCTION SET 4.8: Order Bump / Upsell

**Requirements:**
1. Related products in cart
2. Frequently bought together
3. Checkout upsells
4. One-click add

**Implementation:**
```php
class UpsellService
{
    public function getCartUpsells(Cart $cart): Collection
    {
        // Based on cart items
        // From configuration rules
        return $this->calculateRecommendations($cart);
    }
}
```

---

### INSTRUCTION SET 4.9: Dynamic Checkout Fields

**Requirements:**
1. Custom fields per product
2. Field validation
3. Required/optional configuration
4. Field types (text, select, checkbox, file)

**Database:**
```sql
CREATE TABLE checkout_fields (
    id bigint primary key,
    name string,
    label string,
    type enum('text', 'email', 'phone', 'select', 'checkbox', 'file'),
    options json nullable,
    validation_rules json,
    is_required boolean,
    applies_to enum('all', 'specific_products', 'specific_categories'),
    product_ids json nullable,
    category_ids json nullable,
    sort_order integer,
    is_active boolean
);
```

---

### INSTRUCTION SET 4.10: Cart Sharing

**Requirements:**
1. Generate shareable cart link
2. Import cart from link
3. Collaborative carts (team purchases)

**Implementation:**
```php
class CartSharingService
{
    public function generateShareLink(Cart $cart): string
    {
        $token = Str::random(32);
        
        SharedCart::create([
            'cart_id' => $cart->id,
            'token' => $token,
            'expires_at' => now()->addDays(7)
        ]);
        
        return route('cart.shared', $token);
    }
    
    public function importFromToken(string $token, Cart $targetCart): Cart
    {
        $sharedCart = SharedCart::where('token', $token)->firstOrFail();
        // Copy items to target cart
    }
}
```

---

## PART 5: TESTING REQUIREMENTS

### INSTRUCTION SET 5.1: Backend Tests

Create comprehensive test suites:

#### Unit Tests
```php
tests/Unit/Services/
├── CartServiceTest.php
├── PricingEngineServiceTest.php
├── TaxCalculationServiceTest.php
├── ShippingCalculationServiceTest.php
└── CheckoutSessionManagerTest.php
```

**Example Test Cases:**
```php
class CartServiceTest extends TestCase
{
    /** @test */
    public function it_creates_cart_for_guest_user()
    {
        $cart = $this->cartService->getOrCreate('session_123');
        
        $this->assertNotNull($cart);
        $this->assertEquals('session_123', $cart->session_id);
        $this->assertNull($cart->user_id);
    }
    
    /** @test */
    public function it_adds_item_to_cart()
    {
        $cart = $this->cartService->getOrCreate('session_123');
        $product = Product::factory()->create(['price' => 100]);
        
        $item = $this->cartService->addItem($cart, $product->id, 2);
        
        $this->assertEquals($product->id, $item->product_id);
        $this->assertEquals(2, $item->quantity);
        $this->assertEquals(200, $cart->fresh()->subtotal);
    }
    
    /** @test */
    public function it_applies_quantity_discount_rule()
    {
        // Create rule in database
        $rule = CartPricingRule::create([
            'type' => 'quantity_discount',
            'conditions' => ['min_quantity' => 5],
            'actions' => ['discount_type' => 'percentage', 'discount_value' => 10]
        ]);
        
        $cart = $this->cartService->getOrCreate('session_123');
        $product = Product::factory()->create(['price' => 100]);
        
        $this->cartService->addItem($cart, $product->id, 5);
        $cart = $this->cartService->applyPricingRules($cart);
        
        $this->assertEquals(450, $cart->fresh()->total); // 500 - 10%
    }
}
```

#### Feature Tests
```php
tests/Feature/Api/
├── CartApiTest.php
├── CheckoutApiTest.php
└── PaymentApiTest.php
```

**Example:**
```php
class CartApiTest extends TestCase
{
    /** @test */
    public function guest_can_add_item_to_cart()
    {
        $product = Product::factory()->create(['price' => 100]);
        
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2
        ], [
            'X-Cart-Session' => 'test_session_123'
        ]);
        
        $response->assertStatus(200)
                 ->assertJsonPath('data.items.0.quantity', 2)
                 ->assertJsonPath('data.subtotal', 200);
    }
}
```

---

### INSTRUCTION SET 5.2: Frontend Tests

#### Component Tests (React Testing Library)
```typescript
// CartItem.test.tsx
describe('CartItem', () => {
    it('renders product information', () => {
        const item = createMockCartItem();
        render(<CartItem item={item} />);
        
        expect(screen.getByText(item.product.name)).toBeInTheDocument();
        expect(screen.getByText(`$${item.total}`)).toBeInTheDocument();
    });
    
    it('updates quantity when changed', async () => {
        const onUpdate = jest.fn();
        const item = createMockCartItem();
        
        render(<CartItem item={item} onUpdateQuantity={onUpdate} />);
        
        const input = screen.getByRole('spinbutton');
        await userEvent.clear(input);
        await userEvent.type(input, '5');
        
        expect(onUpdate).toHaveBeenCalledWith(item.id, 5);
    });
});
```

#### Integration Tests
```typescript
// checkout-flow.test.tsx
describe('Checkout Flow', () => {
    it('completes full checkout process', async () => {
        const { store } = renderWithProviders(<CheckoutPage />);
        
        // Step 1: Customer Info
        await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
        await userEvent.click(screen.getByText('Continue'));
        
        // Step 2: Shipping Address
        await fillAddressForm();
        await userEvent.click(screen.getByText('Continue'));
        
        // Step 3: Shipping Method
        await userEvent.click(screen.getByText('Standard Shipping'));
        await userEvent.click(screen.getByText('Continue'));
        
        // Step 4: Payment
        await fillPaymentForm();
        await userEvent.click(screen.getByText('Place Order'));
        
        // Verify order created
        await waitFor(() => {
            expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
        });
    });
});
```

#### E2E Tests (Playwright)
```typescript
// e2e/checkout.spec.ts
test.describe('Cart and Checkout', () => {
    test('user can complete purchase', async ({ page }) => {
        // Add product to cart
        await page.goto('/products/test-product');
        await page.click('button:has-text("Add to Cart")');
        
        // View cart
        await page.click('[aria-label="Cart"]');
        await expect(page.locator('.cart-item')).toHaveCount(1);
        
        // Proceed to checkout
        await page.click('button:has-text("Checkout")');
        
        // Fill shipping info
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="address"]', '123 Test St');
        await page.click('button:has-text("Continue")');
        
        // Select shipping
        await page.click('text=Standard Shipping');
        await page.click('button:has-text("Continue")');
        
        // Payment
        await page.fill('[data-testid="card-number"]', '4111111111111111');
        await page.fill('[data-testid="card-expiry"]', '12/25');
        await page.fill('[data-testid="card-cvc"]', '123');
        
        // Complete
        await page.click('button:has-text("Place Order")');
        
        // Verify success
        await expect(page.locator('h1:has-text("Order Confirmed")')).toBeVisible();
    });
});
```

---

## PART 6: DEPLOYMENT & MONITORING

### INSTRUCTION SET 6.1: Environment Configuration

Create comprehensive `.env` structure:

```bash
# Application
APP_NAME="${APP_NAME}"
APP_ENV="${APP_ENV}"
APP_URL="${APP_URL}"

# Database
DB_CONNECTION=mysql
DB_HOST="${DB_HOST}"
DB_PORT="${DB_PORT}"
DB_DATABASE="${DB_DATABASE}"
DB_USERNAME="${DB_USERNAME}"
DB_PASSWORD="${DB_PASSWORD}"

# Redis
REDIS_HOST="${REDIS_HOST}"
REDIS_PORT="${REDIS_PORT}"
REDIS_PASSWORD="${REDIS_PASSWORD}"

# Cart Configuration
CART_SESSION_TTL=1440
CART_MAX_ITEMS=100
CART_MAX_QUANTITY_PER_ITEM=10
CART_ALLOW_BACKORDERS=false
CART_CLEANUP_DAYS=30

# Checkout Configuration
CHECKOUT_SESSION_TTL=60
CHECKOUT_ENABLE_GUEST=true
CHECKOUT_REQUIRE_PHONE=false

# Tax Configuration
TAX_ENABLED=true
TAX_INCLUSIVE=false
TAX_DIGITAL_PRODUCTS=true

# Shipping Configuration
SHIPPING_CALCULATE_ON_CART=true
SHIPPING_FREE_THRESHOLD=0

# Payment Gateways
RAZORPAY_KEY_ID="${RAZORPAY_KEY_ID}"
RAZORPAY_KEY_SECRET="${RAZORPAY_KEY_SECRET}"
STRIPE_PUBLIC_KEY="${STRIPE_PUBLIC_KEY}"
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"

# Analytics
GOOGLE_ANALYTICS_ID="${GOOGLE_ANALYTICS_ID}"
FACEBOOK_PIXEL_ID="${FACEBOOK_PIXEL_ID}"

# Email
MAIL_FROM_ADDRESS="${MAIL_FROM_ADDRESS}"
CART_ABANDONMENT_EMAIL_ENABLED=true
CART_ABANDONMENT_FIRST_HOURS=1
CART_ABANDONMENT_SECOND_HOURS=24

# Monitoring
SENTRY_DSN="${SENTRY_DSN}"
LOG_CHANNEL=stack
```

---

### INSTRUCTION SET 6.2: Performance Monitoring

**Metrics to Track:**

1. **Cart Operations:**
   - Add to cart latency (p50, p95, p99)
   - Cart load time
   - Cart validation time
   - Pricing calculation time

2. **Checkout:**
   - Checkout completion rate
   - Time to complete checkout
   - Step abandonment rates
   - Payment processing time

3. **API Performance:**
   - Endpoint response times
   - Error rates
   - Request rates
   - Cache hit rates

**Implementation:**
```php
// Laravel Telescope
php artisan telescope:install

// Custom metrics
class MetricsService
{
    public function trackCartOperation(string $operation, float $duration): void
    {
        // Send to monitoring service
    }
}
```

---

### INSTRUCTION SET 6.3: Error Monitoring

**Tools:**
- Sentry (frontend + backend)
- CloudWatch Logs
- Laravel Log

**Error Categories:**
```php
// Tag errors for filtering
Sentry\captureException($exception, [
    'tags' => [
        'operation' => 'checkout',
        'step' => 'payment',
        'gateway' => 'razorpay'
    ],
    'extra' => [
        'user_id' => $userId,
        'order_id' => $orderId
    ]
]);
```

---

## PART 7: DOCUMENTATION REQUIREMENTS

### INSTRUCTION SET 7.1: API Documentation

Create OpenAPI 3.0 specification:

```yaml
openapi: 3.0.0
info:
  title: ShopKart Cart & Checkout API
  version: 1.0.0

paths:
  /api/v1/cart:
    get:
      summary: Get current cart
      parameters:
        - name: X-Cart-Session
          in: header
          schema:
            type: string
      responses:
        200:
          description: Cart retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CartResponse'
```

---

### INSTRUCTION SET 7.2: Component Documentation

Create Storybook stories:

```typescript
// CartItem.stories.tsx
export default {
    title: 'Cart/CartItem',
    component: CartItem,
} as Meta;

export const Default: Story = {
    args: {
        item: createMockCartItem(),
        onUpdateQuantity: action('update'),
        onRemove: action('remove')
    }
};

export const Loading: Story = {
    args: {
        ...Default.args,
        isUpdating: true
    }
};
```

---

### INSTRUCTION SET 7.3: Developer Guide

Create comprehensive documentation:

```markdown
# Developer Guide

## Adding a New Payment Gateway

1. Create gateway class implementing `PaymentGatewayInterface`
2. Register in `config/payment.php`
3. Add configuration fields in `payment_methods` table
4. Create webhook handler
5. Add tests
6. Update documentation

## Adding a New Pricing Rule Type

1. Define rule schema in `cart_pricing_rules.conditions`
2. Implement evaluation logic in `PricingEngineService`
3. Add admin UI for rule creation
4. Add tests
5. Update documentation
```

---

## PART 8: MIGRATION & SEED DATA

### INSTRUCTION SET 8.1: Database Seeders

Create comprehensive seeders:

```php
class SiteSettingsSeeder extends Seeder
{
    public function run()
    {
        $settings = [
            // Cart settings
            ['key' => 'cart.max_items', 'value' => 100, 'type' => 'number', 'category' => 'cart'],
            ['key' => 'cart.max_quantity_per_item', 'value' => 10, 'type' => 'number', 'category' => 'cart'],
            ['key' => 'cart.session_ttl_hours', 'value' => 24, 'type' => 'number', 'category' => 'cart'],
            ['key' => 'cart.allow_backorders', 'value' => false, 'type' => 'boolean', 'category' => 'cart'],
            
            // Tax settings
            ['key' => 'tax.enabled', 'value' => true, 'type' => 'boolean', 'category' => 'tax'],
            ['key' => 'tax.inclusive', 'value' => false, 'type' => 'boolean', 'category' => 'tax'],
            ['key' => 'tax.default_rate', 'value' => 0.18, 'type' => 'number', 'category' => 'tax'],
            
            // Shipping settings
            ['key' => 'shipping.free_threshold', 'value' => 500, 'type' => 'number', 'category' => 'shipping'],
            ['key' => 'shipping.calculate_on_cart', 'value' => true, 'type' => 'boolean', 'category' => 'shipping'],
            
            // Checkout settings
            ['key' => 'checkout.guest_enabled', 'value' => true, 'type' => 'boolean', 'category' => 'checkout'],
            ['key' => 'checkout.require_phone', 'value' => false, 'type' => 'boolean', 'category' => 'checkout'],
            ['key' => 'checkout.min_order_amount', 'value' => 0, 'type' => 'number', 'category' => 'checkout'],
        ];
        
        foreach ($settings as $setting) {
            SiteSetting::create($setting);
        }
    }
}
```

---

## PART 9: DELIVERABLES CHECKLIST

### Backend Deliverables
- [ ] All database migrations
- [ ] All models with relationships
- [ ] All services (Cart, Pricing, Tax, Shipping, Checkout, Payment)
- [ ] All controllers with validation
- [ ] All API resources
- [ ] All tests (unit + feature)
- [ ] API documentation (OpenAPI)
- [ ] Configuration seeders

### Frontend Deliverables
- [ ] Redux store setup (slices + RTK Query)
- [ ] All cart components
- [ ] All checkout components
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states
- [ ] Optimistic updates
- [ ] Analytics integration
- [ ] All tests (component + integration + E2E)
- [ ] Storybook documentation

### DevOps Deliverables
- [ ] Environment configuration
- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Monitoring setup
- [ ] Error tracking
- [ ] Performance monitoring

### Documentation Deliverables
- [ ] API documentation
- [ ] Component documentation
- [ ] Developer guide
- [ ] Deployment guide
- [ ] User guide

---

## FINAL NOTES

### Code Quality Standards
- **TypeScript:** Strict mode enabled
- **PHP:** PSR-12 coding standard
- **ESLint:** Airbnb config + custom rules
- **Prettier:** Enabled
- **PHPStan:** Level 8
- **Test Coverage:** Minimum 80%

### Security Checklist
- [ ] Input validation (all endpoints)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] SQL injection prevention
- [ ] Rate limiting
- [ ] Authentication checks
- [ ] Authorization checks
- [ ] PCI compliance (payments)
- [ ] Encryption (sensitive data)

### Performance Targets
- Cart load: < 200ms
- Add to cart: < 300ms
- Checkout step: < 500ms
- Payment processing: < 3s
- First contentful paint: < 1.5s
- Time to interactive: < 3s

---

## EXECUTION INSTRUCTIONS FOR AGENTIC IDE

1. **READ ALL INSTRUCTIONS** before starting any implementation
2. **NEVER HARDCODE** any business logic values
3. **CREATE MIGRATIONS FIRST** before models
4. **WRITE TESTS** alongside implementation
5. **FOLLOW TYPE SAFETY** strictly
6. **IMPLEMENT ERROR HANDLING** comprehensively
7. **ADD LOGGING** for debugging
8. **DOCUMENT AS YOU GO** (inline comments + external docs)
9. **VALIDATE AGAINST REQUIREMENTS** before marking complete
10. **OPTIMIZE PERFORMANCE** from the start

### Suggested Implementation Order

**Phase 1: Foundation (Week 1)**
1. Database migrations
2. Configuration service
3. Core models
4. Basic cart service

**Phase 2: Cart System (Week 2)**
5. Cart API endpoints
6. Pricing engine
7. Tax calculation
8. Shipping calculation
9. Cart validation

**Phase 3: Checkout System (Week 3)**
10. Checkout session manager
11. Checkout API endpoints
12. Payment gateway abstraction
13. Order processing pipeline

**Phase 4: Frontend (Week 4-5)**
14. Redux store setup
15. Cart components
16. Checkout components
17. Forms and validation

**Phase 5: Advanced Features (Week 6)**
18. Abandoned cart recovery
19. Analytics integration
20. Performance optimization
21. Error handling

**Phase 6: Testing & Polish (Week 7)**
22. Comprehensive testing
23. Documentation
24. Performance tuning
25. Security audit

---

**END OF SPECIFICATION**

This is a comprehensive, production-ready specification for an ultra-premium cart and checkout system. Every component is designed to be configuration-driven with zero hardcoded values, fully typed, tested, and documented.
