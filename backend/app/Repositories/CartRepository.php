<?php

namespace App\Repositories;

use App\Models\Cart;

class CartRepository implements CartRepositoryInterface
{
    public function find(int $id): ?Cart
    {
        return Cart::with(['items.product', 'items.variant'])->find($id);
    }

    public function findByUserId(int $userId): ?Cart
    {
        // Eager load items to avoid N+1 in many cases
        return Cart::with(['items.product', 'items.variant'])
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->first();
    }

    public function findBySessionId(string $sessionId): ?Cart
    {
        return Cart::with(['items.product', 'items.variant'])
            ->where('session_id', $sessionId)
            ->where('status', 'active')
            ->first();
    }

    public function create(array $data): Cart
    {
        return Cart::create($data);
    }

    public function update(Cart $cart, array $data): Cart
    {
        $cart->update($data);
        return $cart;
    }

    public function delete(Cart $cart): bool
    {
        return $cart->delete();
    }
}
