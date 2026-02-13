<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckEnvironment extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-environment';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $required = [
            'app.key' => 'Application Key',
            'database.connections.mysql.database' => 'Database Name',
            'database.connections.mysql.username' => 'Database Username',
            'services.razorpay.key_id' => 'Razorpay Key ID',
            'services.razorpay.key_secret' => 'Razorpay Key Secret',
        ];

        $missing = [];

        foreach ($required as $configKey => $label) {
            $value = config($configKey);
            if (empty($value) || $value === 'null') {
                $missing[] = $label . " ({$configKey})";
            }
        }

        if (!empty($missing)) {
            $this->error('The following environment variables are missing or empty:');
            foreach ($missing as $item) {
                $this->bulletList([$item]);
            }
            return 1;
        }

        $this->info('Environment validation passed. All critical variables are set.');
        return 0;
    }
}
