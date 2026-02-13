export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface User {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    is_active: boolean;
    is_email_verified: boolean;
    date_of_birth?: string;
    gender?: string;
    bio?: string;
    company?: string;
    website?: string;
    timezone: string;
    locale: string;
    last_login_at?: string;
    last_login_ip?: string;
    password_changed_at?: string;
    created_at: string;
    updated_at: string;

    // Virtual relations
    orders_count?: number;
    total_spent?: number;
}

export interface UserActivityLog {
    id: number;
    user_id: number;
    action: string;
    resource?: string;
    resource_id?: number;
    description?: string;
    ip_address?: string;
    user_agent?: string;
    metadata?: any;
    created_at: string;
    updated_at: string;
}

export interface UserStats {
    total_users: number;
    total_customers: number;
    total_admins: number;
    active_users: number;
    inactive_users: number;
    new_this_month: number;
}
