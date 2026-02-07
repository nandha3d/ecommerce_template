<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function create(array $data): Order;
    public function findById(int $id): ?Order;
    public function findByOrderNumber(string $orderNumber): ?Order;
    public function findByUser(User $user, int $perPage = 10): LengthAwarePaginator;
    public function findByIdempotencyKey(string $key): ?Order;
    public function update(Order $order, array $data): bool;
    public function delete(Order $order): bool;
}
