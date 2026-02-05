<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlockedEntity;
use App\Models\FraudCheck;
use App\Models\PaymentVelocity;
use App\Models\FailedPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FraudController extends Controller
{
    /**
     * Get fraud detection dashboard statistics.
     */
    public function dashboard(): JsonResponse
    {
        $now = now();
        $last24h = $now->copy()->subHours(24);
        $last7d = $now->copy()->subDays(7);
        $last30d = $now->copy()->subDays(30);

        return response()->json([
            'success' => true,
            'data' => [
                'total_checks' => [
                    'last_24h' => FraudCheck::where('created_at', '>=', $last24h)->count(),
                    'last_7d' => FraudCheck::where('created_at', '>=', $last7d)->count(),
                    'last_30d' => FraudCheck::where('created_at', '>=', $last30d)->count(),
                ],
                'blocked' => [
                    'last_24h' => FraudCheck::blocked()->where('created_at', '>=', $last24h)->count(),
                    'last_7d' => FraudCheck::blocked()->where('created_at', '>=', $last7d)->count(),
                    'last_30d' => FraudCheck::blocked()->where('created_at', '>=', $last30d)->count(),
                ],
                'block_rate' => [
                    'last_24h' => $this->calculateBlockRate($last24h),
                    'last_7d' => $this->calculateBlockRate($last7d),
                    'last_30d' => $this->calculateBlockRate($last30d),
                ],
                'active_blocked_entities' => BlockedEntity::active()->count(),
                'avg_score_24h' => round(FraudCheck::where('created_at', '>=', $last24h)->avg('score') ?? 0, 1),
                'top_risk_factors' => $this->getTopRiskFactors($last7d),
            ],
        ]);
    }

    /**
     * List fraud checks with filters.
     */
    public function checks(Request $request): JsonResponse
    {
        $query = FraudCheck::with(['order', 'user'])
            ->orderBy('created_at', 'desc');

        if ($request->has('result')) {
            $query->where('result', $request->input('result'));
        }

        if ($request->has('min_score')) {
            $query->where('score', '>=', $request->input('min_score'));
        }

        if ($request->has('email')) {
            $query->where('email', 'like', '%' . $request->input('email') . '%');
        }

        if ($request->has('ip')) {
            $query->where('ip_address', $request->input('ip'));
        }

        $checks = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $checks,
        ]);
    }

    /**
     * Add blocked entity.
     */
    public function block(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:ip,email,card,device',
            'value' => 'required|string|max:255',
            'reason' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $entity = BlockedEntity::blockEntity(
            $validated['type'],
            $validated['value'],
            $validated['reason'] ?? null,
            auth()->id(),
            isset($validated['expires_at']) ? new \DateTime($validated['expires_at']) : null
        );

        return response()->json([
            'success' => true,
            'message' => ucfirst($validated['type']) . ' blocked successfully',
            'data' => $entity,
        ]);
    }

    /**
     * Remove blocked entity.
     */
    public function unblock(int $id): JsonResponse
    {
        $entity = BlockedEntity::findOrFail($id);
        $entity->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Entity unblocked successfully',
        ]);
    }

    /**
     * Get blocked entities list.
     */
    public function blockedEntities(Request $request): JsonResponse
    {
        $query = BlockedEntity::with('blockedByUser')
            ->orderBy('created_at', 'desc');

        if ($request->input('active_only', true)) {
            $query->active();
        }

        if ($request->has('type')) {
            $query->ofType($request->input('type'));
        }

        $entities = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $entities,
        ]);
    }

    /**
     * Get IP address history.
     */
    public function ipHistory(string $ip): JsonResponse
    {
        $checks = FraudCheck::where('ip_address', $ip)
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        $velocity = PaymentVelocity::where('type', 'ip')
            ->where('value', $ip)
            ->first();

        $isBlocked = BlockedEntity::isBlocked('ip', $ip);

        return response()->json([
            'success' => true,
            'data' => [
                'ip' => $ip,
                'is_blocked' => $isBlocked,
                'total_checks' => $checks->count(),
                'blocked_count' => $checks->where('result', 'block')->count(),
                'avg_score' => round($checks->avg('score') ?? 0, 1),
                'velocity' => $velocity,
                'recent_checks' => $checks->take(20),
            ],
        ]);
    }

    /**
     * Get failed payments for recovery management.
     */
    public function failedPayments(Request $request): JsonResponse
    {
        $query = FailedPayment::with(['order', 'user'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('recovery_status', $request->input('status'));
        }

        $payments = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    // Private helpers

    private function calculateBlockRate(\DateTime $since): float
    {
        $total = FraudCheck::where('created_at', '>=', $since)->count();
        if ($total === 0) return 0;

        $blocked = FraudCheck::blocked()->where('created_at', '>=', $since)->count();
        return round(($blocked / $total) * 100, 2);
    }

    private function getTopRiskFactors(\DateTime $since): array
    {
        $checks = FraudCheck::where('created_at', '>=', $since)
            ->whereNotNull('risk_factors')
            ->get();

        $factorCounts = [];
        foreach ($checks as $check) {
            foreach ($check->risk_factors ?? [] as $factor) {
                $factorCounts[$factor] = ($factorCounts[$factor] ?? 0) + 1;
            }
        }

        arsort($factorCounts);
        return array_slice($factorCounts, 0, 5, true);
    }
}
