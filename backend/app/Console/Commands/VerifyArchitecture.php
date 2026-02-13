<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Cart;
use App\Models\PaymentIntent;
use App\Services\CartStateMachine;
use App\Services\PaymentStateMachine;
use App\Enums\PaymentIntentState;
use Illuminate\Support\Facades\Log;

class VerifyArchitecture extends Command
{
    protected $signature = 'verify:architecture';
    protected $description = 'Verify Phase 2 refactoring and state machines';

    public function handle()
    {
        $this->info("Starting Phase 2 Architecture Verification...");

        // 1. Verify Cart State Machine
        $this->comment("\nTesting Cart State Machine...");
        try {
            $cart = new Cart();
            $cart->status = CartStateMachine::STATE_ACTIVE;
            $cart->session_id = 'verify_session_' . uniqid();
            $cart->subtotal = 100.00;
            $cart->total = 100.00;
            $cart->save();

            $stateMachine = app(CartStateMachine::class);
            $stateMachine->transition($cart, CartStateMachine::STATE_CHECKOUT);
            
            if ($cart->status === CartStateMachine::STATE_CHECKOUT) {
                $this->info("✔ CartStateMachine: Transition active -> checkout successful.");
            } else {
                $this->error("✘ CartStateMachine: Transition failed.");
            }

            try {
                $stateMachine->transition($cart, CartStateMachine::STATE_ACTIVE);
                 $this->info("✔ CartStateMachine: Transition checkout -> active successful.");
            } catch (\Exception $e) {
                 $this->error("✘ CartStateMachine: Transition checkout -> active failed: " . $e->getMessage());
            }

        } catch (\Exception $e) {
            $this->error("✘ CartStateMachine ERROR: " . $e->getMessage());
        }

        // 2. Verify Payment State Machine
        $this->comment("\nTesting Payment State Machine...");
        try {
            $intent = new PaymentIntent();
            $intent->status = PaymentIntentState::CREATED;
            $intent->amount = 50.00;
            $intent->currency = 'USD';
            $intent->payment_method = 'card';
            $intent->save();

            $paymentSM = app(PaymentStateMachine::class);
            $paymentSM->transition($intent, PaymentIntentState::PROCESSING);
            
            if ($intent->status === PaymentIntentState::PROCESSING) {
                $this->info("✔ PaymentStateMachine: Transition created -> processing successful.");
            } else {
                $this->error("✘ PaymentStateMachine: Transition failed.");
            }
        } catch (\Exception $e) {
            $this->error("✘ PaymentStateMachine ERROR: " . $e->getMessage());
        }

        // 3. Verify Trait Integration
        $this->comment("\nVerifying Controller Trait Integration...");
        $controllers = [
            \App\Http\Controllers\Api\CartController::class,
            \App\Http\Controllers\Api\OrderController::class,
            \App\Http\Controllers\Api\PaymentController::class,
        ];

        foreach ($controllers as $controllerClass) {
            $traits = class_uses_recursive($controllerClass);
            if (isset($traits[\App\Traits\StandardizesApiResponse::class])) {
                $this->info("✔ {$controllerClass} uses StandardizesApiResponse trait.");
            } else {
                $this->error("✘ {$controllerClass} MISSING StandardizesApiResponse trait.");
            }
        }

        $this->info("\nVerification Finished.");
        return 0;
    }
}
