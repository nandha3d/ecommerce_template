<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     * Only admin can view all users.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     * Users can view themselves, admins can view anyone.
     */
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     * Only admin can create users.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     * Users can update themselves, admins can update anyone.
     */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     * Only super_admin can delete users.
     */
    public function delete(User $user, User $model): bool
    {
        // Cannot delete self
        if ($user->id === $model->id) {
            return false;
        }

        return $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can restore the model.
     * Super admin only.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Super admin only.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return $user->role === 'super_admin' && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can change password.
     * Users can change their own password, admins can reset anyone's.
     */
    public function changePassword(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->isAdmin();
    }
}
