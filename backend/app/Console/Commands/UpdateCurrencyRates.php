<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Core\System\Services\ExchangeRateProvider;

class UpdateCurrencyRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'currency:update-rates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch and update currency exchange rates from external provider';

    /**
     * Execute the console command.
     */
    public function handle(ExchangeRateProvider $provider)
    {
        $this->info('Starting exchange rate update...');
        
        try {
            $provider->updateRates();
            $this->info('Exchange rates updated successfully.');
            // Clear cache
            \Illuminate\Support\Facades\Cache::forget('currency:active_list');
        } catch (\Exception $e) {
            $this->error('Failed to update rates: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
