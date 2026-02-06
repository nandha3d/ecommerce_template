<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Cart Service Provider
 * 
 * Binds all cart-related services and their dependencies for proper DI resolution.
 */
class CartServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind the ConfigurationService with an alias for Core namespace
        $this->app->bind(
            \Core\Cart\Services\ConfigurationService::class,
            \App\Services\ConfigurationService::class
        );
        
        // Also bind App\Services\ConfigurationService as a singleton
        $this->app->singleton(\App\Services\ConfigurationService::class, function ($app) {
            return new \App\Services\ConfigurationService();
        });
        
        // Bind PricingEngineService
        $this->app->singleton(\App\Services\Cart\PricingEngineService::class, function ($app) {
            return new \App\Services\Cart\PricingEngineService();
        });
        
        // Bind TaxCalculationService
        $this->app->singleton(\App\Services\Cart\TaxCalculationService::class, function ($app) {
            return new \App\Services\Cart\TaxCalculationService();
        });
        
        // Bind ShippingCalculationService
        $this->app->singleton(\App\Services\Cart\ShippingCalculationService::class, function ($app) {
            return new \App\Services\Cart\ShippingCalculationService();
        });
        
        // Bind CartService with all its dependencies
        $this->app->singleton(\Core\Cart\Services\CartService::class, function ($app) {
            return new \Core\Cart\Services\CartService(
                $app->make(\Core\Base\Events\EventBus::class),
                $app->make(\App\Repositories\CartRepositoryInterface::class),
                $app->make(\App\Services\ConfigurationService::class),
                $app->make(\App\Services\Cart\PricingEngineService::class),
                $app->make(\App\Services\Cart\TaxCalculationService::class),
                $app->make(\App\Services\Cart\ShippingCalculationService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
