<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryReservation;
use App\Enums\InventoryReservationState;
use Illuminate\Support\Facades\Log;

class ReleaseExpiredReservations extends Command
{
    protected $signature = 'inventory:cleanup-reservations';
    protected $description = 'Release expired inventory reservations';

    public function handle()
    {
        $this->info('Cleaning up expired reservations...');

        $expired = InventoryReservation::where('status', InventoryReservationState::RESERVED)
            ->where('expires_at', '<', now())
            ->get();

        if ($expired->isEmpty()) {
            $this->info('No expired reservations found.');
            return 0;
        }

        foreach ($expired as $reservation) {
            $reservation->status = InventoryReservationState::RELEASED;
            $reservation->save();

            Log::info("Reservation #{$reservation->id} for Order #{$reservation->order_id} has expired and was released.");
        }

        $this->info("Released {$expired->count()} reservations.");
        return 0;
    }
}
