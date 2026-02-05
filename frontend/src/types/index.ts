// User types
export interface User {
    id: number;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    role: 'customer' | 'admin' | 'manager';
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Address {
    id: number;
    user_id: number;
    type: 'billing' | 'shipping';
    name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}

// Product types
export interface Product {
    id: number;
    slug: string;
    name: string;
    description: string;
    short_description?: string;
    price: number;
    sale_price?: number;
    sku: string;
    stock_quantity: number;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
    brand?: Brand;
    categories: Category[];
    images: ProductImage[];
    variants: ProductVariant[];
    nutrition_facts?: NutritionFacts;
    ingredients?: string;
    benefits?: string[];
    tags: string[];
    average_rating: number;
    review_count: number;
    is_featured: boolean;
    is_bestseller: boolean;
    is_new: boolean;
    is_active: boolean;
    // New fields
    is_digital?: boolean;
    is_downloadable?: boolean;
    has_customization?: boolean;
    customization_fields?: CustomizationField[];
    custom_tabs?: CustomTab[];
    image_layout?: 'horizontal' | 'vertical';
    addon_groups?: AddonGroup[];
    specifications?: SpecificationSection[];
    created_at: string;
    updated_at: string;
}

export interface SpecificationItem {
    key: string;
    value: string;
}

export interface SpecificationSection {
    id: string;
    title: string;
    items: SpecificationItem[];
}

export interface CustomizationField {
    id: string;
    type: 'text' | 'textarea' | 'file' | 'color';
    label: string;
    required: boolean;
}

export interface CustomTab {
    id: string;
    title: string;
    content: string;
}

export interface AddonGroup {
    id: number;
    name: string;
    description?: string;
    selection_type: 'single' | 'multiple';
    is_required: boolean;
    min_selections: number;
    max_selections?: number;
    options: AddonOption[];
}

export interface AddonOption {
    id: number;
    name: string;
    price: number;
    is_default: boolean;
    image?: string;
}

export interface ProductImage {
    id: number;
    url: string;
    alt?: string;
    is_primary: boolean;
    sort_order: number;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    name: string;
    sku: string;
    price: number;
    sale_price?: number;
    stock_quantity: number;
    attributes: Record<string, string>;
    image?: string;
}

export interface NutritionFacts {
    serving_size: string;
    servings_per_container: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    custom_nutrients?: { name: string; value: string; daily_value?: string }[];
}

export interface Brand {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parent_id?: number;
    children?: Category[];
    products_count?: number;
    is_active: boolean;
    sort_order?: number;
}

// Cart types
export interface Cart {
    id: number;
    items: CartItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    coupon?: Coupon;
}

export interface CartItem {
    id: number;
    product_id: number;
    variant_id?: number;
    product: Product;
    variant?: ProductVariant;
    quantity: number;
    unit_price: number;
    total_price: number;
}

// Order types
export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    user?: User;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: string;
    items: OrderItem[];
    billing_address: Address;
    shipping_address: Address;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    coupon?: Coupon;
    notes?: string;
    tracking_number?: string;
    shipped_at?: string;
    delivered_at?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variant_id?: number;
    product_name: string;
    variant_name?: string;
    sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    image?: string;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded';

// Coupon types
export interface Coupon {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount?: number;
    max_discount?: number;
    usage_limit?: number;
    used_count: number;
    expires_at?: string;
    is_active: boolean;
}

// Review types
export interface Review {
    id: number;
    user_id: number;
    product_id: number;
    user?: User;
    rating: number;
    title?: string;
    comment: string;
    is_approved: boolean;
    created_at: string;
}

// Wishlist types
export interface WishlistItem {
    id: number;
    product_id: number;
    product: Product;
    added_at: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

// Filter types
export interface ProductFilters {
    search?: string;
    category?: string;
    brand?: string;
    min_price?: number;
    max_price?: number;
    rating?: number;
    in_stock?: boolean;
    goals?: string[];
    sort_by?: 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
    page?: number;
    per_page?: number;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

// Analytics types (Admin)
export interface DashboardStats {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
    revenue_change: number;
    orders_change: number;
    customers_change: number;
    recent_orders: Order[];
    top_products: {
        product: Product;
        total_sold: number;
        revenue: number;
    }[];
    sales_chart: {
        labels: string[];
        data: number[];
    };
}
