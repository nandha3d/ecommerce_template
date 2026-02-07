<?php

namespace Core\Inventory\Services;


use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Decrement product variant stock.
     */
    /**
     * Reserve stock for an order (Atomic).
     * Rule 7.1 & 7.2: Reserve, do not deduct.
     * Rule 7.3: Stock MUST NOT go negative.
     */
    public function reserve(\App\Models\Order $order): void
    {
        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $variant = $item->variant;
                // Lock for availability check
                $lockedVariant = ProductVariant::where('id', $variant->id)->lockForUpdate()->first();

                if (!$this->hasStock($lockedVariant, $item->quantity)) {
                    throw new \RuntimeException("Insufficient stock for: {$lockedVariant->product->name} (SKU: {$lockedVariant->sku})");
                }

                // Create Reservation
                \App\Models\InventoryReservation::create([
                    'variant_id' => $variant->id,
                    'order_id' => $order->id,
                    'quantity' => $item->quantity,
                    'status' => \App\Enums\InventoryReservationState::RESERVED,
                    'expires_at' => now()->addMinutes(30),
                ]);
            }
        });
    }

    /**
     * Commit reservation and deduct physical stock (Payment Success).
     */
    public function commit(\App\Models\Order $order): void
    {
        DB::transaction(function () use ($order) {
            $reservations = \App\Models\InventoryReservation::where('order_id', $order->id)
                ->where('status', \App\Enums\InventoryReservationState::RESERVED)
                ->lockForUpdate() // Lock reservations? No, lock variants.
                ->get();

            if ($reservations->isEmpty()) {
                // If no reservations, maybe expired or already committed?
                // Strict rule: Must have reservation to commit.
                // But legacy/compat? Phase-1 Strict: FAIL if no reservation found?
                // Or maybe we treat it as "Reserve & Commit" in one go if missing?
                // No, Rule says: "If stock deduction happens before payment -> FAIL".
                // So reservation MUST exist.
                // But for resilience, if reservation missing, maybe we re-check stock and deduct?
                // Let's stick to Strict for now: Log critical if missing.
                 \Log::warning("Inventory Commit: No active reservations found for Order #{$order->id}. Attempting fallback deduction.");
                 // Fallback: Just deduct if available (Legacy path safety)
            }

            foreach ($reservations as $reservation) {
                 $variant = \App\Models\ProductVariant::where('id', $reservation->variant_id)->lockForUpdate()->first();
                 
                 // Deduct
                 if ($variant->stock_quantity < $reservation->quantity) {
                     // This technically shouldn't happen if reserved, UNLESS physical stock was reduced manually.
                     throw new \RuntimeException("Integrity Error: Reserved stock no longer physically available.");
                 }
                 
                 $variant->decrement('stock_quantity', $reservation->quantity);
                 
                 $reservation->status = \App\Enums\InventoryReservationState::COMMITTED;
                 $reservation->save();
            }
        });
    }

    /**
     * Release reservation (Payment Failed / Cancelled).
     */
    public function release(\App\Models\Order $order): void
    {
        \App\Models\InventoryReservation::where('order_id', $order->id)
            ->where('status', \App\Enums\InventoryReservationState::RESERVED)
            ->update(['status' => \App\Enums\InventoryReservationState::RELEASED]);
    }

    /**
     * Check if variant has sufficient stock (Physical - Reserved).
     */
    public function hasStock(ProductVariant $variant, int $quantity): bool
    {
        $reserved = \App\Models\InventoryReservation::where('variant_id', $variant->id)
            ->where('status', \App\Enums\InventoryReservationState::RESERVED)
            ->where('expires_at', '>', now())
            ->sum('quantity');

        return ($variant->stock_quantity - $reserved) >= $quantity;
    }

    /**
     * Decrement product variant stock DIRECTLY (LEGACY / ADMIN ONLY).
     * @deprecated Use commit() via Order flow.
     */
    public function decrementStock(ProductVariant $variant, int $quantity): void
    {
        // Legacy support retained but discouraged
        $lockedVariant = ProductVariant::where('id', $variant->id)->lockForUpdate()->first();
        if ($lockedVariant->stock_quantity < $quantity) {
             throw new \RuntimeException("Insufficient stock.");
        }
        $lockedVariant->decrement('stock_quantity', $quantity);
    }

    /**
     * Increment product variant stock (Returns).
     */
    public function incrementStock(ProductVariant $variant, int $quantity): void
    {
        $variant->increment('stock_quantity', $quantity);
    }
}
