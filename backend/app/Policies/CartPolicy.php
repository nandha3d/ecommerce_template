<?php

namespace App\Policies;

use App\Models\Cart;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CartPolicy
{
    /**
     * Determine whether the user can view any models.
     * Users can only view their own carts.
     */
    public function viewAny(User $user): bool
    {
        return true; // Filtered by query in controller
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Cart $cart): bool
    {
        return $user->id === $cart->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     * Any authenticated user can create a cart.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Users can only update their own cart.
     */
    public function update(User $user, Cart $cart): bool
    {
        return $user->id === $cart->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     * Users can only delete their own cart.
     */
    public function delete(User $user, Cart $cart): bool
    {
        return $user->id === $cart->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     * Admin only.
     */
    public function restore(User $user, Cart $cart): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Super admin only.
     */
    public function forceDelete(User $user, Cart $cart): bool
    {
        return $user->role === 'super_admin';
    }
}
