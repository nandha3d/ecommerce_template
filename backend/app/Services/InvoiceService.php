<?php

namespace App\Services;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class InvoiceService
{
    /**
     * Generate PDF invoice for an order
     * 
     * @param Order $order
     * @return string|null Path to the stored invoice
     */
    public function generateInvoice(Order $order): ?string
    {
        try {
            // Load necessary relationships if not loaded
            $order->loadMissing(['items.product', 'billingAddress', 'shippingAddress', 'user']);

            // Generate PDF from view
            // Assuming we have a view 'invoices.default'
            $pdf = Pdf::loadView('invoices.default', ['order' => $order]);

            // Define path
            $filename = "invoice_{$order->order_number}.pdf";
            $path = "invoices/{$order->user_id}/{$filename}";

            // Store file
            Storage::disk('public')->put($path, $pdf->output());

            Log::info("Invoice generated for Order #{$order->order_number} at {$path}");

            return $path;
        } catch (\Exception $e) {
            Log::error("Failed to generate invoice for Order #{$order->order_number}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Download invoice
     */
    public function downloadInvoice(Order $order)
    {
        // Implementation for controller usage
        $order->loadMissing(['items.product', 'billingAddress', 'shippingAddress', 'user']);
        $pdf = Pdf::loadView('invoices.default', ['order' => $order]);
        return $pdf->download("invoice_{$order->order_number}.pdf");
    }
}
