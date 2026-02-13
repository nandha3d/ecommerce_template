<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filtering
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate($request->get('limit', 15));

        return $this->success($users, 'Users retrieved successfully');
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['customer', 'admin', 'super_admin'])],
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string|max:2048',
            'address_line_1' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation error', 'VALIDATION_ERROR', 422, $validator->errors());
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone' => $request->phone,
            'avatar' => $request->avatar,
            'is_active' => true,
        ]);

        if ($request->filled('address_line_1')) {
            $user->addresses()->create([
                'type' => 'shipping',
                'name' => $user->name,
                'phone' => $user->phone ?? 'N/A',
                'address_line_1' => $request->address_line_1,
                'city' => $request->city,
                'state' => $request->state,
                'postal_code' => $request->postal_code,
                'country' => $request->country ?? 'United States',
                'is_default' => true,
            ]);
        }

        return $this->success($user, 'User created successfully', 201);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::with(['addresses', 'orders.items' => function($q) {
            $q->latest();
        }])->findOrFail($id);
        
        return $this->success($user, 'User details retrieved successfully');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', Rule::in(['customer', 'admin', 'super_admin'])],
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string|max:2048',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation error', 'VALIDATION_ERROR', 422, $validator->errors());
        }

        $user->update($request->all());

        return $this->success($user, 'User updated successfully');
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting yourself
        if (auth()->id() == $user->id) {
            return $this->error('You cannot delete your own account', 'FORBIDDEN', 403);
        }

        $user->delete();

        return $this->success(null, 'User deleted successfully');
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'activated' : 'deactivated';
        return $this->success($user, "User {$status} successfully");
    }

    /**
     * Change user role.
     */
    public function changeRole(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'role' => ['required', Rule::in(['customer', 'admin', 'super_admin'])]
        ]);

        $user->role = $request->role;
        $user->save();

        return $this->success($user, 'User role updated successfully');
    }

    /**
     * Reset user password by admin.
     */
    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'password' => 'required|string|min:8'
        ]);

        $user->password = Hash::make($request->password);
        $user->password_changed_at = now();
        $user->save();

        return $this->success(null, 'Password reset successfully');
    }

    /**
     * Get user activity logs.
     */
    public function activityLogs($id)
    {
        $user = User::findOrFail($id);
        $logs = $user->activityLogs()->latest()->paginate(20);

        return $this->success($logs, 'Activity logs retrieved successfully');
    }
}
