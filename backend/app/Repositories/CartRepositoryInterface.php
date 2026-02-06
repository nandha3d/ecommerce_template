<?php

namespace App\Repositories;

use App\Models\Cart;

interface CartRepositoryInterface
{
    public function find(int $id): ?Cart;
    public function findByUserId(int $userId): ?Cart;
    public function findBySessionId(string $sessionId): ?Cart;
    public function create(array $data): Cart;
    public function update(Cart $cart, array $data): Cart;
    public function delete(Cart $cart): bool;
}
