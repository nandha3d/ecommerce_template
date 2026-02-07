<?php

namespace App\Policies;

use App\Models\Address;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AddressPolicy
{
    /**
     * Determine whether the user can view any addresses.
     * Users can only view their own addresses.
     */
    public function viewAny(User $user): bool
    {
        return true; // Filtered by query in controller
    }

    /**
     * Determine whether the user can view the address.
     * Users can only view their own addresses.
     */
    public function view(User $user, Address $address): bool
    {
        return $user->id === $address->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can create addresses.
     * Any authenticated user can create addresses.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the address.
     * Users can only update their own addresses.
     */
    public function update(User $user, Address $address): bool
    {
        return $user->id === $address->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the address.
     * Users can only delete their own addresses.
     */
    public function delete(User $user, Address $address): bool
    {
        return $user->id === $address->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the address.
     * Admin only.
     */
    public function restore(User $user, Address $address): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the address.
     * Super admin only.
     */
    public function forceDelete(User $user, Address $address): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can set as default.
     * Users can set their own address as default.
     */
    public function setDefault(User $user, Address $address): bool
    {
        return $user->id === $address->user_id || $user->isAdmin();
    }
}
