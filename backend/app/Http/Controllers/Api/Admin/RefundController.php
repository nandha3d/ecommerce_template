<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RefundRequest;
use App\Traits\StandardizesApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    use StandardizesApiResponse;

    /**
     * List all refund requests
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $query = RefundRequest::with(['user', 'order'])->latest();

        if ($status) {
            $query->where('status', $status);
        }

        $refunds = $query->paginate(20);

        return $this->success($refunds, 'Refund requests retrieved successfully');
    }

    /**
     * Approve a refund request
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $refund = RefundRequest::findOrFail($id);
        
        if ($refund->status !== 'pending') {
            return $this->error('Only pending refunds can be approved', 'INVALID_STATUS', 400);
        }

        $refund->approve(auth()->id(), $request->input('notes'));

        // TODO: Trigger actual payment gateway refund here (Razorpay/Stripe)
        // For now, we just mark as approved in DB.

        return $this->success($refund, 'Refund request approved successfully');
    }

    /**
     * Reject a refund request
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $refund = RefundRequest::findOrFail($id);

        if ($refund->status !== 'pending') {
            return $this->error('Only pending refunds can be rejected', 'INVALID_STATUS', 400);
        }

        $refund->reject(auth()->id(), $request->input('notes'));

        return $this->success($refund, 'Refund request rejected successfully');
    }
}
