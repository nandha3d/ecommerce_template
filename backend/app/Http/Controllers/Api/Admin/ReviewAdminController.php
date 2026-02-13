<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Traits\StandardizesApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewAdminController extends Controller
{
    use StandardizesApiResponse;

    /**
     * List all reviews for moderation
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status'); // 'approved', 'pending'
        $query = Review::with(['user', 'product'])->latest();

        if ($status === 'approved') {
            $query->where('is_approved', true);
        } elseif ($status === 'pending') {
            $query->where('is_approved', false);
        }

        $reviews = $query->paginate(20);

        return $this->success($reviews, 'Reviews retrieved successfully');
    }

    /**
     * Approve a review
     */
    public function approve(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->update(['is_approved' => true]);

        return $this->success($review, 'Review approved successfully');
    }

    /**
     * Reject/Unapprove a review
     */
    public function reject(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->update(['is_approved' => false]);

        return $this->success($review, 'Review rejected/unapproved successfully');
    }

    /**
     * Delete a review
     */
    public function destroy(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return $this->success(null, 'Review deleted successfully');
    }
}
