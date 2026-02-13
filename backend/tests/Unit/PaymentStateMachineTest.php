<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\PaymentIntent;
use App\Enums\PaymentIntentState;
use App\Services\PaymentStateMachine;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentStateMachineTest extends TestCase
{
    use RefreshDatabase;

    private PaymentStateMachine $stateMachine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->stateMachine = new PaymentStateMachine();
    }

    public function test_can_transition_from_created_to_processing()
    {
        $intent = new PaymentIntent();
        $intent->status = PaymentIntentState::CREATED;
        $intent->amount = 100.00;
        $intent->currency = 'USD';
        $intent->payment_method = 'card';
        $intent->save();
        
        $this->assertTrue($this->stateMachine->canTransition(PaymentIntentState::CREATED, PaymentIntentState::PROCESSING));
        
        $this->stateMachine->transition($intent, PaymentIntentState::PROCESSING);
        
        $this->assertEquals(PaymentIntentState::PROCESSING, $intent->status);
    }

    public function test_cannot_transition_from_succeeded_to_failed()
    {
        $intent = new PaymentIntent();
        $intent->status = PaymentIntentState::SUCCEEDED;
        $intent->amount = 100.00;
        $intent->currency = 'USD';
        $intent->payment_method = 'card';
        $intent->save();
        
        $this->expectException(\DomainException::class);
        $this->stateMachine->transition($intent, PaymentIntentState::FAILED);
    }
}
