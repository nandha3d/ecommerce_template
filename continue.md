Audit Remediation (Critical Security & Architecture)
Goal
Resolve Critical Failures identified in Audit (Locking, Snapshot, Immutability).

Database Changes
[NEW] 
2026_02_06_000005_enhance_checkout_sessions_snapshot.php
Add Snapshot Columns: subtotal, discount, tax_amount, shipping_cost, 
total
.
Add Status/Locking Columns if missing.
Key Refactoring - Phase 1 (Completed)
[MODIFY] 
CheckoutSessionManager.php
Start: Lock Cart (status='locked').
Update: Update 
CheckoutSession
 snapshot columns.
Key Refactoring - Phase 2 (Security Hardening)
[MODIFY] 
CartService.php
Price Validation: In 
recalculate
, validate unit_price against DB. Throw 
PriceChangedException
 if mismatch > 0.01.
[MODIFY] 
CartController.php
Session ID: Use Str::random(40) instead of uniqid.
Validation: Strict regex for guest_cart_id.
Coupons: Generic error messages to prevent enumeration.
[MODIFY] 
api.php
Rate Limiting: Apply throttle:cart and throttle:coupon.
Database Changes
[NEW] 
2026_02_06_000006_migrate_to_variant_first_model.php
 Create migration 2026_02_06_000006_migrate_to_variant_first_model
 Auto-create default variants for simple products.
 Move price/stock data.
 Make Product columns nullable.
 Refactor 
Product
 Model
 Update price accessors to warn/log or return variant price.
 Update stock accessors.
 
getFinalPrice
 should throw exception if called on Product.
Schema Updates:
Make products.price, products.stock_quantity nullable (or comment as Deprecated).
Ensure product_variants columns are authoritative.
Key Refactoring - Phase 2 (Security Hardening) - COMPLETED
...

Key Refactoring - Phase 5 (Variant-First Architecture)
[MODIFY] 
Product.php
Deprecate: price, sale_price, stock_quantity properties.
Logic: 
getFinalPrice
, isInStock must delegate to variants->first() (or throw if specific variant needed).
Rule: is_sellable check should fail if no variant selected.
[MODIFY] 
CartService.php
Validation: 
addItem
 MUST require variant_id.
Fail Check: Throw exception if variant_id is missing.
[MODIFY] 
InventoryService.php
Stock Management: Ensure all stock operations target product_variants.
[MODIFY] 
ProductService.php
Creation: When creating a "Simple Product", automatically create a Default Variant with the provided price/stock.
Modify Cart: Verify cart add/remove fails when locked.
Snapshot: Verify checkout_sessions table has totals.
Order: Verify Order totals match Session totals.



Supplement E-commerce Engine - Tasks
STRICT DIRECTIVE: No new features until architectural violations and compliance gaps are resolved.

0. Critical Functional Fixes (Pre-Refactor)
 Fix "Cart Empty" on refresh (Session/Auth bug)
 Verify Checkout Flow (Address + Order Creation)
 Fix "Dotted Cross Line" visual artifact
Phase 1: Core Architecture (Foundation)
 Scaffold Layer Structure
 Create app/Services, app/Repositories, app/DTOs, app/Enums, app/Policies
 Refactor Core
 Abstract File Storage -> MediaService (Service Created)
 Remove hardcoded strings -> Enums (Enums Created)
Phase 2: Product Module (Compliance Critical)
 Refactor ProductController -> 
ProductService
 + 
ProductRepository
 Implement Variants System (SKU, Stock, Attributes)
 Compliance Fields (FSSAI, Ingredients, Nutrition, Batch, Expiry)
Phase 3: Auth & Category
 Auth: Implement Policies, Roles, Activity Logs (Activity Logs need composer update)
 Category Refactor: 
CategoryService
, CategoryRepository
 Category SEO: Ensure SEO meta fields are supported
Phase 4: Commerce Engine (Cart/Order/Payment)
 Cart Module:
 Refactor to 
CartService
 (Standardized)
 Implement 
CartRepository
 
CartController
 Cleanup (Delegation)
 DEBUGGING: Cart Persistence Failure (Fixed via Proxy & Session Header)
 Unit Tests for Cart Logic
 Order Module:
 State Machine (OrderState Enum)
 Refactor to 
OrderService
 (Architecture)
 Implement 
OrderRepository
 Invoice Generation (Service implemented)
 Refund/Cancellation Logic (Via PaymentGatewayInterface)
 Payment Module:
 Gateway Interface (Abstraction)
 Gateway Implementation (Stripe)
 Payment Service & Controller
 Webhook Handler
 Invoice Generation Service (Code complete, needs dompdf)
 Shipping Module:
 Shiprocket Service Implementation
 Product Module Updates:
 Add Specifications logic (JSON field)
Phase 5: Address & Pricing Engine (In Progress)
 Address Logic:
 AddressValidationService (State-GST Map)
 Integrate with AddressController
 Pricing Engine:
 PricingEngineService (Rule Evaluation Logic)
 Integrate with CartService (Recalculate Totals)
Phase 4.5: Hardcoded Values Audit (Completed)
 Backend Services
 Refactor 
FraudDetectionService
 (Thresholds)
 Refactor 
PaymentVelocity
 (Rate Limits)
 Refactor 
LicenseManager
 & 
ModuleManager
 (Cache/Config)
 Frontend Refactoring
 Refactor 
CheckoutPage.tsx
 (Layout logic)
 Refactor 
imageUtils.ts
 (Config service)
 Verification
 Run 
verify_no_hardcoding.php
 script
Phase 5: STRICT PRODUCT DOMAIN AUDIT & REFACTOR (Active)
Step 1: Category Module Audit (Passed)
 Step 2: Product Core Audit (Failed -> Refactoring)
 Step 3: Variant Migration (The "Migration Agent")
 Migration: Create default variants for all simple products.
 Data Move: Shift Price/Stock/SKU to Variants.
 Step 4: Codebase Refactor
 Cart Enforcement: Update 
CartService
 to reject non-variant additions.
 Deprecate Product Price: Logic should throw exception for Product::getFinalPrice.
 Admin/API Layer: Ensure API 
ProductResource
 returns variant price. [/] Frontend: Verify AddToCart uses variant_id.
 Step 5: Frontend/API Checks (Compatibility)
 Ensure API returns correct structure.
 Check Admin Panel "Simple Product" editing (Proxy to Default Variant).
 Step 6: Final Verification
 Enforce "Everything is a Variant".
Phase 6: Address & Extras
 Address: Validation, State-GST Mapping
 Addons: Rule Engine, Price Resolver
 Modules: Config-based persistence (features table)
Phase 7: Analytics & Optimization
 Sales Analytics
 Image Optimization Pipeline
 API Rate Limiting
Completed Work (Legacy)
 Initial Laravel Setup
 Basic Admin/API Controllers
 Frontend Theme Integration
 Checkout UI Refactor (Inline Address)



Progress Updates
1
Creating Migration for Variant Data Move

2
Running Migration and Refactoring Product Model

3
Enforcing Variant-First in CartService

4
Updating CartService with strict Variant-only logic

5
Updating ProductService to auto-generate variants

6
Auditing InventoryService for Variant Compliance

7
Searching for InventoryService usages

8
Updating InventoryService to use ProductVariant

9
Updating OrderService to use Variant-aware InventoryService

10
Updating OrderItem and OrderService

11
Checking Stock Reservation Logic

12
Refactoring ReserveStockListener and OrderService

13
Refactoring OrderService::cancelOrder

14
Verifying ProductResource API compatibility

15
Auditing API Resources for Price logic

16
Fixing ProductResource and CartItemResource

17
Refactoring CartItemResource and Validating CartResource

18
Verifying Frontend 'Add to Cart' Logic

19
Listing Frontend Product Components to find AddToCart logic

20
Listing Product Feature directory to find Add Cart logic

21
Searching for AddToCart logic in Frontend (Broad Search)

22
Auditing Frontend Cart Service for Payload Structure

23
Implementing Compatibility Layer in CartService