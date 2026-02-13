<?php

namespace App\Jobs;

use App\Models\Order;
use App\Mail\OrderConfirmation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Order $order;
    public int $tries = 3;
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("Sending order confirmation email for #{$this->order->order_number}");
            
            $recipient = $this->order->user->email ?? $this->order->billingAddress->email;
            
            if (!$recipient) {
                Log::error("No recipient email found for order #{$this->order->order_number}");
                return;
            }

            Mail::to($recipient)->send(new OrderConfirmation($this->order));
            
            Log::info("Order confirmation email sent successfully for #{$this->order->order_number}");
        } catch (\Exception $e) {
            Log::error("Failed to send order confirmation email for #{$this->order->order_number}: " . $e->getMessage());
            throw $e;
        }
    }
}
