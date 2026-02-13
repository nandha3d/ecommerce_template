<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use Core\System\Controllers\SystemController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Controllers\Api\AddonController;
use App\Http\Controllers\Api\BundleController;
use App\Http\Controllers\Api\PriceOfferController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CustomizationController;
use App\Http\Controllers\Api\LicenseController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

Route::get('/test-attributes', function () {
    try {
        $attributes = \App\Models\ProductAttribute::with('options')->get();
        return response()->json([
            'count' => $attributes->count(),
            'data' => $attributes
        ]);
    } catch (\Throwable $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


// API Version 1
Route::prefix('v1')->group(function () {

    // ============================================
    // Globalization Context
    // ============================================
    Route::get('/context', [App\Http\Controllers\Api\ContextController::class, 'getContext']);

    // ============================================
    // License Routes (Public + Admin)
    // ============================================
    Route::prefix('license')->group(function () {
        Route::get('/status', [LicenseController::class, 'status']);
        Route::post('/activate', [LicenseController::class, 'activate']);
        Route::get('/check/{module}', [LicenseController::class, 'checkModule']);
        
        Route::middleware(['auth:api', 'admin'])->group(function () {
            Route::get('/modules', [LicenseController::class, 'modules']);
            Route::post('/revalidate', [LicenseController::class, 'revalidate']);
            Route::post('/deactivate', [LicenseController::class, 'deactivate']);
        });
    });


    // Authentication Routes - Strict Rate Limiting (5 per minute)
    Route::middleware(['throttle:auth'])->prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        
        Route::middleware('auth:api')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::put('/profile', [AuthController::class, 'updateProfile']);
            Route::put('/password', [AuthController::class, 'changePassword']);
        });
    });

    // Product Routes (Public) - Lenient Rate Limiting (120 per minute)
    Route::middleware(['throttle:public'])->prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/featured', [ProductController::class, 'featured']);
        Route::get('/best-sellers', [ProductController::class, 'bestSellers']);
        Route::get('/new-arrivals', [ProductController::class, 'newArrivals']);
        Route::get('/categories', [ProductController::class, 'categories']);
        Route::get('/brands', [ProductController::class, 'brands']);
        Route::get('/{slug}', [ProductController::class, 'show']);
        Route::get('/{id}/related', [ProductController::class, 'related']);
    });

    // ============================================
    // System Config Route (Public)
    // ============================================
    Route::get('/system/config', [SystemController::class, 'getConfig']);
    Route::get('/configuration/variant-builder', [SystemController::class, 'getVariantBuilderConfig']);

    // ============================================
    // Cart Routes (Guest + Authenticated)
    // ============================================
    // ============================================
    // Cart Routes (Guest + Authenticated)
    // ============================================
    Route::prefix('cart')->middleware(['cart.owner'])->group(function () {
        // Apply General Cart Throttle (30/min) + Ownership Check
        Route::middleware('throttle:cart')->group(function () {
            Route::get('/', [CartController::class, 'index']);
            Route::post('/items', [CartController::class, 'addItem']);
            Route::put('/items/{itemId}', [CartController::class, 'updateItem']);
            Route::delete('/items/{itemId}', [CartController::class, 'removeItem']);
            Route::delete('/clear', [CartController::class, 'clear']);
            Route::delete('/coupon', [CartController::class, 'removeCoupon']);
            
            Route::middleware('auth:api')->group(function () {
                Route::post('/merge', [CartController::class, 'merge']);
            });
        });

        // Apply Strict Coupon Throttle (5/min)
        Route::post('/coupon', [CartController::class, 'applyCoupon'])
            ->middleware('rate.limit:coupon');
    });

    // Order Routes (Authenticated) - Medium Rate Limiting (10 per minute)
    Route::middleware(['auth:api', 'throttle:checkout'])->prefix('orders')->group(function () {
        // Validation Endpoint (Phase 1)
        Route::post('/validate', [OrderController::class, 'validateOrder']);
        
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::get('/number/{orderNumber}', [OrderController::class, 'showByNumber']);
        Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
    });

    // ============================================
    // Address Routes (Authenticated)
    // ============================================
    Route::middleware('auth:api')->prefix('addresses')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\AddressController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\AddressController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Api\AddressController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Api\AddressController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\AddressController::class, 'destroy']);
        Route::post('/{id}/default', [\App\Http\Controllers\Api\AddressController::class, 'setDefault']);
    });

    // ============================================
    // Wishlist Routes (Authenticated) - TODO: Implement WishlistController
    // ============================================
    // ============================================
    // Wishlist Routes (Authenticated)
    // ============================================
    Route::middleware('auth:api')->prefix('wishlist')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\WishlistController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\WishlistController::class, 'store']); // Changed from /{productId} to root with body
        Route::delete('/{productId}', [\App\Http\Controllers\Api\WishlistController::class, 'destroy']);
        Route::get('/check/{productId}', [\App\Http\Controllers\Api\WishlistController::class, 'check']);
    });

    // ============================================
    // Review Routes - TODO: Implement ReviewController
    // ============================================
    // Route::prefix('reviews')->group(function () {
    //     Route::get('/product/{productId}', 'ReviewController@index');
    //     
    //     Route::middleware('auth:api')->group(function () {
    //         Route::post('/product/{productId}', 'ReviewController@store');
    //         Route::put('/{id}', 'ReviewController@update');
    //         Route::delete('/{id}', 'ReviewController@destroy');
    //     });
    // });

    // ============================================
    // Globalization Routes (Public)
    // ============================================
    Route::prefix('settings')->group(function () {
        // Currencies
        Route::get('/currencies', [App\Http\Controllers\Api\CurrencyController::class, 'index']);
        Route::post('/currency/switch', [App\Http\Controllers\Api\CurrencyController::class, 'switch']);
        
        // Timezones
        Route::get('/timezones', [App\Http\Controllers\Api\TimezoneController::class, 'index']);
        Route::post('/timezone/switch', [App\Http\Controllers\Api\TimezoneController::class, 'switch']);

        // Locations
        Route::get('/locations/countries', [App\Http\Controllers\Api\LocationController::class, 'getCountries']);
        Route::get('/locations/states/{countryCode}', [App\Http\Controllers\Api\LocationController::class, 'getStates']);
    });

    // ============================================
    // Admin Routes
    // ============================================
    // ============================================
    // Admin Routes (Authenticated + Admin Role)
    // ============================================
    Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
        // Products Management
        Route::apiResource('products', \App\Http\Controllers\Api\Admin\ProductController::class);

        // Coupons Management
        Route::apiResource('coupons', \App\Http\Controllers\Api\Admin\CouponController::class);

        // Refund Management
        Route::get('/refunds', [\App\Http\Controllers\Api\Admin\RefundController::class, 'index']);
        Route::post('/refunds/{id}/approve', [\App\Http\Controllers\Api\Admin\RefundController::class, 'approve']);
        Route::post('/refunds/{id}/reject', [\App\Http\Controllers\Api\Admin\RefundController::class, 'reject']);

        // Review Management
        Route::get('/reviews', [\App\Http\Controllers\Api\Admin\ReviewAdminController::class, 'index']);
        Route::post('/reviews/{id}/approve', [\App\Http\Controllers\Api\Admin\ReviewAdminController::class, 'approve']);
        Route::post('/reviews/{id}/reject', [\App\Http\Controllers\Api\Admin\ReviewAdminController::class, 'reject']);
        Route::delete('/reviews/{id}', [\App\Http\Controllers\Api\Admin\ReviewAdminController::class, 'destroy']);

        // System Settings
        Route::get('/settings/system', [\App\Http\Controllers\Api\Admin\SystemSettingController::class, 'index']);
        Route::post('/settings/system', [\App\Http\Controllers\Api\Admin\SystemSettingController::class, 'update']);
        Route::apiResource('settings/taxes', \App\Http\Controllers\Api\Admin\TaxAdminController::class);

        // Globalization Admin — Currencies
        Route::prefix('currencies')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\Admin\CurrencyAdminController::class, 'index']);
            Route::post('/', [App\Http\Controllers\Api\Admin\CurrencyAdminController::class, 'store']);
            Route::post('/{id}/toggle', [App\Http\Controllers\Api\Admin\CurrencyAdminController::class, 'toggleActive']);
            Route::post('/{id}/default', [App\Http\Controllers\Api\Admin\CurrencyAdminController::class, 'setDefault']);
            Route::put('/{id}', [App\Http\Controllers\Api\Admin\CurrencyAdminController::class, 'update']);
            Route::delete('/{id}', [App\Http\Controllers\Api\Admin\CurrencyAdminController::class, 'destroy']);
        });

        // Globalization Admin — Timezones
        Route::prefix('timezones')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\Admin\TimezoneAdminController::class, 'index']);
            Route::get('/identifiers', [App\Http\Controllers\Api\Admin\TimezoneAdminController::class, 'validIdentifiers']);
            Route::post('/', [App\Http\Controllers\Api\Admin\TimezoneAdminController::class, 'store']);
            Route::post('/{id}/toggle', [App\Http\Controllers\Api\Admin\TimezoneAdminController::class, 'toggleActive']);
            Route::post('/{id}/default', [App\Http\Controllers\Api\Admin\TimezoneAdminController::class, 'setDefault']);
            Route::put('/{id}', [App\Http\Controllers\Api\Admin\TimezoneAdminController::class, 'update']);
            Route::delete('/{id}', [App\Http\Controllers\Api\Admin\TimezoneAdminController::class, 'destroy']);
        });

        // Settings — Read-only for admin settings page
        Route::get('settings/currencies', [\App\Http\Controllers\Api\Admin\CurrencyAdminController::class, 'index']);
        Route::get('settings/timezones', [\App\Http\Controllers\Api\Admin\TimezoneAdminController::class, 'index']);
    });

    // ============================================
    // Module System Routes
    // ============================================
    Route::get('/modules/features', [ModuleController::class, 'features']);
    
    Route::middleware(['auth:api', 'admin'])->prefix('modules')->group(function () {
        Route::get('/', [ModuleController::class, 'index']);
        Route::post('/{slug}/toggle', [ModuleController::class, 'toggle']);
        Route::put('/{slug}/config', [ModuleController::class, 'updateConfig']);
        
        // Shipping Specific Routes
        Route::post('/shipping/shiprocket/config', [\App\Http\Controllers\Api\ShippingController::class, 'updateConfig']);
        Route::get('/shipping/shiprocket/test', [\App\Http\Controllers\Api\ShippingController::class, 'testConnection']);
        Route::post('/shipping/shiprocket/orders', [\App\Http\Controllers\Api\ShippingController::class, 'createShipment']);
    });

    // ============================================
    // Product Variants Routes
    // ============================================
    Route::get('/attributes', [ProductVariantController::class, 'attributes']);
    Route::get('/products/{productId}/variants', [ProductVariantController::class, 'index']);
    
    Route::middleware(['auth:api', 'admin'])->group(function () {
        Route::post('/products/{productId}/variants', [ProductVariantController::class, 'store']);
        Route::put('/variants/{id}', [ProductVariantController::class, 'update']);
        Route::delete('/variants/{id}', [ProductVariantController::class, 'destroy']);
        Route::post('/variants/{id}/duplicate', [ProductVariantController::class, 'duplicate']);
        
        // Bulk Operations
        Route::post('/variants/bulk-stock', [ProductVariantController::class, 'bulkUpdateStock']);
        Route::post('/variants/bulk-price', [ProductVariantController::class, 'bulkUpdatePrice']);
        Route::post('/variants/bulk-cost', [ProductVariantController::class, 'bulkUpdateCost']);
        Route::post('/variants/bulk-delete', [ProductVariantController::class, 'bulkDelete']);
        Route::post('/variants/bulk-duplicate', [ProductVariantController::class, 'bulkDuplicate']);
        
        // Import/Export
        Route::post('/variants/import', [\App\Http\Controllers\Api\VariantImportExportController::class, 'import']);
        Route::get('/variants/export', [\App\Http\Controllers\Api\VariantImportExportController::class, 'export']);
        
        // Advanced Management
        Route::get('/variants/low-stock', [ProductVariantController::class, 'lowStock']);
        Route::get('/products/{productId}/cost-analysis', [ProductVariantController::class, 'costAnalysis']);

        // Matrix Generation
        Route::post('/variants/generate-matrix', [ProductVariantController::class, 'generateMatrix']);
        Route::post('/products/{productId}/variants/persist-matrix', [ProductVariantController::class, 'persistMatrix']);
    });

    // ============================================
    // Product Add-ons Routes
    // ============================================
    Route::get('/products/{productId}/addons', [AddonController::class, 'forProduct']);
    
    Route::middleware(['auth:api', 'admin'])->prefix('addons')->group(function () {
        Route::get('/', [AddonController::class, 'index']);
        Route::post('/', [AddonController::class, 'store']);
        Route::put('/{id}', [AddonController::class, 'update']);
        Route::delete('/{id}', [AddonController::class, 'destroy']);
        Route::post('/{id}/attach', [AddonController::class, 'attachToProducts']);
    });

    // ============================================
    // Product Bundles Routes
    // ============================================
    Route::get('/bundles', [BundleController::class, 'active']);
    Route::get('/bundles/{id}', [BundleController::class, 'show']);
    
    Route::middleware(['auth:api', 'admin'])->prefix('admin/bundles')->group(function () {
        Route::get('/', [BundleController::class, 'index']);
        Route::post('/', [BundleController::class, 'store']);
        Route::put('/{id}', [BundleController::class, 'update']);
        Route::delete('/{id}', [BundleController::class, 'destroy']);
    });

    // ============================================
    // Price Offers Routes
    // ============================================
    Route::get('/offers', [PriceOfferController::class, 'active']);
    Route::post('/offers/calculate', [PriceOfferController::class, 'calculate']);
    
    Route::middleware(['auth:api', 'admin'])->prefix('admin/offers')->group(function () {
        Route::get('/', [PriceOfferController::class, 'index']);
        Route::get('/{id}', [PriceOfferController::class, 'show']);
        Route::post('/', [PriceOfferController::class, 'store']);
        Route::put('/{id}', [PriceOfferController::class, 'update']);
        Route::delete('/{id}', [PriceOfferController::class, 'destroy']);
    });

    // Payment Gateway Routes - Medium Rate Limiting (10 per minute)
    Route::middleware(['throttle:checkout'])->group(function () {
        Route::get('/payment/gateways', [PaymentController::class, 'gateways']);
        
        // Payment routes with rate limiting and fraud protection
        Route::middleware(['payment.rate_limit'])->group(function () {
            Route::post('/payment/initiate', [PaymentController::class, 'initiate']);
        });
        
        Route::post('/payment/verify', [PaymentController::class, 'verify']);
        Route::post('/payment/failed', [PaymentController::class, 'failed']);
        Route::post('/payment/webhook', [PaymentController::class, 'handleWebhook']);
    });
    
    Route::middleware(['auth:api', 'admin'])->prefix('admin/payment')->group(function () {
        Route::get('/gateways', [PaymentController::class, 'index']);
        Route::put('/gateways/{id}', [PaymentController::class, 'updateGateway']);
        Route::get('/orders/{orderId}/transactions', [PaymentController::class, 'transactions']);
    });

    // ============================================
    // Product Customization Routes
    // ============================================
    Route::middleware('auth:api')->prefix('customizations')->group(function () {
        Route::get('/', [CustomizationController::class, 'index']);
        Route::post('/upload', [CustomizationController::class, 'upload']);
        Route::put('/{id}', [CustomizationController::class, 'update']);
        Route::post('/{id}/submit', [CustomizationController::class, 'submit']);
        Route::delete('/{id}', [CustomizationController::class, 'destroy']);
    });
    
    Route::middleware(['auth:api', 'admin'])->prefix('admin/customizations')->group(function () {
        Route::get('/', [CustomizationController::class, 'adminIndex']);
        Route::post('/{id}/approve', [CustomizationController::class, 'approve']);
        Route::post('/{id}/reject', [CustomizationController::class, 'reject']);
    });

    // ============================================
    // Admin Product Management Routes
    // ============================================
    Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
        Route::get('/products', [\App\Http\Controllers\Admin\ProductController::class, 'index']);
        Route::post('/products', [\App\Http\Controllers\Admin\ProductController::class, 'store']);
        Route::get('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'show']);
        Route::put('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'update']);
        Route::delete('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy']);
        Route::post('/products/bulk', [\App\Http\Controllers\Admin\ProductController::class, 'bulk']);

        // Image Upload
        Route::post('/upload/images', [\App\Http\Controllers\Admin\ImageUploadController::class, 'upload']);
        Route::post('/upload/image', [\App\Http\Controllers\Admin\ImageUploadController::class, 'uploadSingle']);
        Route::delete('/upload/image', [\App\Http\Controllers\Admin\ImageUploadController::class, 'delete']);

        // Categories
        Route::apiResource('categories', \App\Http\Controllers\Admin\CategoryController::class);

        // User Management
        Route::prefix('users')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\UserController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Admin\UserController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Admin\UserController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Admin\UserController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Admin\UserController::class, 'destroy']);
            Route::post('/{id}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus']);
            Route::post('/{id}/role', [\App\Http\Controllers\Admin\UserController::class, 'changeRole']);
            Route::post('/{id}/reset-password', [\App\Http\Controllers\Admin\UserController::class, 'resetPassword']);
            Route::get('/{id}/activity', [\App\Http\Controllers\Admin\UserController::class, 'activityLogs']);
        });

        // Brands
        Route::get('/brands', function () {
            return response()->json([
                'success' => true,
                'data' => \App\Models\Brand::orderBy('name')->get(),
            ]);
        });

        // Attributes (Global variant attributes with swatches)
        Route::get('/attributes', [\App\Http\Controllers\Admin\AttributeController::class, 'index']);
        Route::get('/attributes/types', [\App\Http\Controllers\Admin\AttributeController::class, 'types']);
        Route::post('/attributes', [\App\Http\Controllers\Admin\AttributeController::class, 'store']);
        Route::get('/attributes/{id}', [\App\Http\Controllers\Admin\AttributeController::class, 'show']);
        Route::put('/attributes/{id}', [\App\Http\Controllers\Admin\AttributeController::class, 'update']);
        Route::delete('/attributes/{id}', [\App\Http\Controllers\Admin\AttributeController::class, 'destroy']);

        // ============================================
        // Analytics Routes
        // ============================================
        Route::get('/analytics/dashboard', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'dashboard']);
        Route::get('/analytics/variant-performance', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'variantPerformance']);
        Route::get('/analytics/attribute-analysis', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'attributeAnalysis']);


        // ============================================
        // Fraud Detection Routes
        // ============================================
        Route::prefix('fraud')->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\FraudController::class, 'dashboard']);
            Route::get('/checks', [\App\Http\Controllers\Api\Admin\FraudController::class, 'checks']);
            Route::get('/blocked', [\App\Http\Controllers\Api\Admin\FraudController::class, 'blockedEntities']);
            Route::post('/block', [\App\Http\Controllers\Api\Admin\FraudController::class, 'block']);
            Route::delete('/unblock/{id}', [\App\Http\Controllers\Api\Admin\FraudController::class, 'unblock']);
            Route::get('/ip/{ip}', [\App\Http\Controllers\Api\Admin\FraudController::class, 'ipHistory']);
            Route::get('/failed-payments', [\App\Http\Controllers\Api\Admin\FraudController::class, 'failedPayments']);
        });

        // ============================================
        // Theme Settings Routes
        // ============================================
        Route::prefix('theme')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\ThemeSettingsController::class, 'index']);
            Route::put('/', [\App\Http\Controllers\Api\Admin\ThemeSettingsController::class, 'update']);
            Route::post('/reset', [\App\Http\Controllers\Api\Admin\ThemeSettingsController::class, 'reset']);
        });
    });
    // ============================================
    // Search Routes
    // ============================================
    Route::get('/search', [App\Http\Controllers\Api\SearchController::class, 'search']);
    Route::get('/search/suggestions', [App\Http\Controllers\Api\SearchController::class, 'suggestions']);

});




