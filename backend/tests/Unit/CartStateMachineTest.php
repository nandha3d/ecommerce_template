<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Cart;
use App\Services\CartStateMachine;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CartStateMachineTest extends TestCase
{
    use RefreshDatabase;

    private CartStateMachine $stateMachine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->stateMachine = new CartStateMachine();
    }

    public function test_can_transition_from_active_to_checkout()
    {
        $cart = new Cart();
        $cart->status = CartStateMachine::STATE_ACTIVE;
        $cart->session_id = 'test_session_123';
        $cart->save();
        
        $this->assertTrue($this->stateMachine->canTransition(CartStateMachine::STATE_ACTIVE, CartStateMachine::STATE_CHECKOUT));
        
        $this->stateMachine->transition($cart, CartStateMachine::STATE_CHECKOUT);
        
        $this->assertEquals(CartStateMachine::STATE_CHECKOUT, $cart->status);
    }

    public function test_can_transition_from_checkout_to_active()
    {
        $cart = new Cart();
        $cart->status = CartStateMachine::STATE_CHECKOUT;
        $cart->session_id = 'test_session_456';
        $cart->save();
        
        $this->assertTrue($this->stateMachine->canTransition(CartStateMachine::STATE_CHECKOUT, CartStateMachine::STATE_ACTIVE));
        
        $this->stateMachine->transition($cart, CartStateMachine::STATE_ACTIVE);
        
        $this->assertEquals(CartStateMachine::STATE_ACTIVE, $cart->status);
    }

    public function test_cannot_transition_to_invalid_state()
    {
        $cart = new Cart();
        $cart->status = CartStateMachine::STATE_COMPLETED;
        $cart->session_id = 'test_session_789';
        $cart->save();
        
        $this->expectException(\DomainException::class);
        $this->stateMachine->transition($cart, CartStateMachine::STATE_ACTIVE);
    }
}
