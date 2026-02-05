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


    // ============================================
    // Authentication Routes
    // ============================================
    Route::prefix('auth')->group(function () {
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

    // ============================================
    // Product Routes (Public)
    // ============================================
    Route::prefix('products')->group(function () {
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

    // ============================================
    // Cart Routes (Guest + Authenticated)
    // ============================================
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/items', [CartController::class, 'addItem']);
        Route::put('/items/{itemId}', [CartController::class, 'updateItem']);
        Route::delete('/items/{itemId}', [CartController::class, 'removeItem']);
        Route::delete('/clear', [CartController::class, 'clear']);
        Route::post('/coupon', [CartController::class, 'applyCoupon']);
        Route::delete('/coupon', [CartController::class, 'removeCoupon']);
        
        Route::middleware('auth:api')->group(function () {
            Route::post('/merge', [CartController::class, 'merge']);
        });
    });

    // ============================================
    // Order Routes (Authenticated)
    // ============================================
    Route::middleware('auth:api')->prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::get('/number/{orderNumber}', [OrderController::class, 'showByNumber']);
        Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
    });

    // ============================================
    // Address Routes (Authenticated) - TODO: Implement AddressController
    // ============================================
    // Route::middleware('auth:api')->prefix('addresses')->group(function () {
    //     Route::get('/', 'AddressController@index');
    //     Route::post('/', 'AddressController@store');
    //     Route::get('/{id}', 'AddressController@show');
    //     Route::put('/{id}', 'AddressController@update');
    //     Route::delete('/{id}', 'AddressController@destroy');
    //     Route::post('/{id}/default', 'AddressController@setDefault');
    // });

    // ============================================
    // Wishlist Routes (Authenticated) - TODO: Implement WishlistController
    // ============================================
    // Route::middleware('auth:api')->prefix('wishlist')->group(function () {
    //     Route::get('/', 'WishlistController@index');
    //     Route::post('/{productId}', 'WishlistController@add');
    //     Route::delete('/{productId}', 'WishlistController@remove');
    //     Route::get('/check/{productId}', 'WishlistController@check');
    // });

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
    // Admin Routes - TODO: Implement Admin Controllers
    // ============================================
    // Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
    //     // Dashboard
    //     Route::get('/dashboard/stats', 'Admin\DashboardController@stats');
    //     Route::get('/dashboard/recent-orders', 'Admin\DashboardController@recentOrders');
    //     Route::get('/dashboard/top-products', 'Admin\DashboardController@topProducts');

    //     // Products Management
    //     Route::apiResource('products', 'Admin\ProductController');
    //     Route::post('/products/{id}/images', 'Admin\ProductController@uploadImages');
    //     Route::delete('/products/{id}/images/{imageId}', 'Admin\ProductController@deleteImage');

    //     // Categories Management
    //     Route::apiResource('categories', 'Admin\CategoryController');

    //     // Brands Management
    //     Route::apiResource('brands', 'Admin\BrandController');

    //     // Orders Management
    //     Route::get('/orders', 'Admin\OrderController@index');
    //     Route::get('/orders/{id}', 'Admin\OrderController@show');
    //     Route::put('/orders/{id}/status', 'Admin\OrderController@updateStatus');

    //     // Customers Management
    //     Route::get('/customers', 'Admin\CustomerController@index');
    //     Route::get('/customers/{id}', 'Admin\CustomerController@show');

    //     // Coupons Management
    //     Route::apiResource('coupons', 'Admin\CouponController');

    //     // Reviews Management
    //     Route::get('/reviews', 'Admin\ReviewController@index');
    //     Route::put('/reviews/{id}/approve', 'Admin\ReviewController@approve');
    //     Route::delete('/reviews/{id}', 'Admin\ReviewController@destroy');
    // });

    // ============================================
    // Module System Routes
    // ============================================
    Route::get('/modules/features', [ModuleController::class, 'features']);
    
    Route::middleware(['auth:api', 'admin'])->prefix('modules')->group(function () {
        Route::get('/', [ModuleController::class, 'index']);
        Route::post('/{slug}/toggle', [ModuleController::class, 'toggle']);
        Route::put('/{slug}/config', [ModuleController::class, 'updateConfig']);
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
        Route::post('/variants/bulk-stock', [ProductVariantController::class, 'bulkUpdateStock']);
        Route::post('/variants/generate-matrix', [ProductVariantController::class, 'generateMatrix']);
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

    // ============================================
    // Payment Gateway Routes
    // ============================================
    Route::get('/payment/gateways', [PaymentController::class, 'gateways']);
    
    // Payment routes with rate limiting and fraud protection
    Route::middleware(['payment.rate_limit'])->group(function () {
        Route::post('/payment/initiate', [PaymentController::class, 'initiate']);
    });
    
    Route::post('/payment/verify', [PaymentController::class, 'verify']);
    Route::post('/payment/failed', [PaymentController::class, 'failed']);
    
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
        // Products CRUD
        Route::get('/products', [\App\Http\Controllers\Admin\ProductController::class, 'index']);
        Route::post('/products', [\App\Http\Controllers\Admin\ProductController::class, 'store']);
        Route::get('/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'show']);
        Route::put('/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'update']);
        Route::delete('/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy']);
        Route::post('/products/bulk', [\App\Http\Controllers\Admin\ProductController::class, 'bulk']);

        // Image Upload
        Route::post('/upload/images', [\App\Http\Controllers\Admin\ImageUploadController::class, 'upload']);
        Route::post('/upload/image', [\App\Http\Controllers\Admin\ImageUploadController::class, 'uploadSingle']);
        Route::delete('/upload/image', [\App\Http\Controllers\Admin\ImageUploadController::class, 'delete']);

        // Categories
        Route::apiResource('categories', \App\Http\Controllers\Admin\CategoryController::class);

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
});




