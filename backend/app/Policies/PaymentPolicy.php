<?php

namespace App\Policies;

use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PaymentPolicy
{
    /**
     * Determine whether the user can view any payment transactions.
     * Admin can view all, users can only view their own (filtered in controller).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the payment transaction.
     * Users can only view payments for their own orders.
     */
    public function view(User $user, PaymentTransaction $payment): bool
    {
        // Load order relationship if not loaded
        if (!$payment->relationLoaded('order')) {
            $payment->load('order');
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $payment->order && $payment->order->user_id === $user->id;
    }

    /**
     * Determine whether the user can initiate a payment.
     * Any authenticated user can initiate payment for their own orders.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the payment.
     * Only admin can update payment records.
     */
    public function update(User $user, PaymentTransaction $payment): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the payment.
     * Only super admin can delete payment records.
     */
    public function delete(User $user, PaymentTransaction $payment): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can process refunds.
     * Admin only.
     */
    public function refund(User $user, PaymentTransaction $payment): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view payment gateways.
     * Admin only.
     */
    public function viewGateways(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update payment gateways.
     * Admin only.
     */
    public function updateGateway(User $user): bool
    {
        return $user->isAdmin();
    }
}
