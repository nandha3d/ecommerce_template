<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    /**
     * Determine whether the user can view any models.
     * Users can only view their own orders (filtered by controller).
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view their orders
    }

    /**
     * Determine whether the user can view the model.
     * Users can only view their own orders.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     * Any authenticated user can create an order.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Only admin can update orders.
     */
    public function update(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     * Only admin can delete orders.
     */
    public function delete(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can cancel the order.
     * Users can cancel their own pending orders.
     */
    public function cancel(User $user, Order $order): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $order->user_id && 
               in_array($order->status, ['pending', 'pending_payment', 'processing']);
    }

    /**
     * Determine whether the user can restore the model.
     * Admin only.
     */
    public function restore(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Super admin only.
     */
    public function forceDelete(User $user, Order $order): bool
    {
        return $user->role === 'super_admin';
    }
}
