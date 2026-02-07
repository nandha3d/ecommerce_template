<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Core\Pricing\Repositories\PricingRuleRepository;
use Core\Pricing\Services\RuleEngine;
use Core\Base\Events\EventBus;
use Core\Boot\CoreBootstrapper;
use Illuminate\Support\Facades\DB;
use App\Infrastructure\Env\EnvValidator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind PDO for Core Repositories
        $this->app->bind('CorePDO', function () {
            return DB::connection()->getPdo();
        });

        // Bind ProductRepository
        $this->app->bind(
            \App\Repositories\ProductRepositoryInterface::class,
            \App\Repositories\ProductRepository::class
        );

        // Bind Repository
        $this->app->bind(PricingRuleRepository::class, function ($app) {
            return new PricingRuleRepository($app->make('CorePDO'));
        });

        // Bind RuleEngine (Dependency Injection)
        $this->app->bind(RuleEngine::class, function ($app) {
            return new RuleEngine($app->make(PricingRuleRepository::class));
        });

        // Singleton EventBus
        $this->app->singleton(EventBus::class, function ($app) {
            return new EventBus();
        });

        // Bind Payment Gateway
        $this->app->bind(\Core\Payment\Gateways\PaymentGatewayInterface::class, function ($app) {
            $config = config('services.razorpay');
            
            if (class_exists(\Razorpay\Api\Api::class) && !empty($config['key_id'])) {
                return new \Core\Payment\Gateways\RazorpayGateway(
                    $config['key_id'],
                    $config['key_secret'],
                    $config['currency'] ?? 'INR'
                );
            }
            
            return new \Core\Payment\Gateways\NullPaymentGateway();
        });

        // Bind Analytics Service
        $this->app->bind(\Core\Analytics\Services\AnalyticsService::class, function ($app) {
            return new \Core\Analytics\Services\AnalyticsService($app->make('CorePDO'));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // CRITICAL: Validate environment first - app MUST crash if misconfigured
        EnvValidator::validate();

        /** @var EventBus $eventBus */
        $eventBus = $this->app->make(EventBus::class);
        
        // Boot Core Events (Pure PHP, no Laravel ServiceProvider in Core)
        CoreBootstrapper::boot($eventBus);
    }
}
