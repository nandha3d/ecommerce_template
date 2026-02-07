/**
 * Zod Validation Schemas for API contracts
 * Provides runtime type validation for API responses
 */
import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const paginationSchema = z.object({
    current_page: z.number(),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
});

export const timestampsSchema = z.object({
    created_at: z.string(),
    updated_at: z.string(),
});

// ============================================
// Auth Schemas
// ============================================

export const loginRequestSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerRequestSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
});

export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['customer', 'admin']),
    phone: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
}).merge(timestampsSchema.partial());

export const authTokensSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    token_type: z.literal('bearer'),
    expires_in: z.number(),
});

export const authResponseSchema = z.object({
    user: userSchema,
    tokens: authTokensSchema,
});

// ============================================
// Product Schemas
// ============================================

export const productImageSchema = z.object({
    id: z.number(),
    url: z.string().url(),
    alt: z.string().optional(),
    is_primary: z.boolean().optional(),
});

export const productVariantSchema = z.object({
    id: z.number(),
    sku: z.string(),
    price: z.number(),
    stock: z.number(),
    attributes: z.record(z.string(), z.string()),
});

export const productSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    short_description: z.string().nullable(),
    sku: z.string(),
    price: z.number(),
    sale_price: z.number().nullable(),
    stock: z.number(),
    is_active: z.boolean(),
    is_featured: z.boolean().optional(),
    images: z.array(productImageSchema),
    variants: z.array(productVariantSchema).optional(),
    category_id: z.number().nullable().optional(),
    brand_id: z.number().nullable().optional(),
    average_rating: z.number().optional(),
    review_count: z.number().optional(),
}).merge(timestampsSchema.partial());

export const productListResponseSchema = z.object({
    data: z.array(productSchema),
    meta: paginationSchema.optional(),
});

export const productDetailResponseSchema = z.object({
    data: productSchema,
});

// ============================================
// Cart Schemas
// ============================================

export const cartItemSchema = z.object({
    id: z.number(),
    product_id: z.number(),
    product: productSchema,
    variant_id: z.number().nullable(),
    variant: productVariantSchema.nullable(),
    quantity: z.number().min(1),
    unit_price: z.number(),
    total_price: z.number(),
});

export const cartSchema = z.object({
    id: z.number(),
    items: z.array(cartItemSchema),
    subtotal: z.number(),
    tax: z.number(),
    shipping: z.number(),
    discount: z.number(),
    total: z.number(),
    coupon: z.object({
        code: z.string(),
        discount: z.number(),
    }).nullable(),
});

export const addToCartRequestSchema = z.object({
    product_id: z.number(),
    variant_id: z.number().optional(),
    quantity: z.number().min(1),
});

// ============================================
// Order Schemas
// ============================================

export const addressSchema = z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string(),
    address_line_1: z.string(),
    address_line_2: z.string().nullable(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
    is_default: z.boolean().optional(),
});

export const orderItemSchema = z.object({
    id: z.number(),
    product_id: z.number(),
    product_name: z.string(),
    variant_id: z.number().nullable(),
    quantity: z.number(),
    unit_price: z.number(),
    total_price: z.number(),
});

export const orderSchema = z.object({
    id: z.number(),
    order_number: z.string(),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
    payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']),
    items: z.array(orderItemSchema),
    billing_address: addressSchema.nullable(),
    shipping_address: addressSchema.nullable(),
    subtotal: z.number(),
    tax: z.number(),
    shipping: z.number(),
    discount: z.number(),
    total: z.number(),
    notes: z.string().nullable(),
}).merge(timestampsSchema);

export const createOrderRequestSchema = z.object({
    billing_address_id: z.number().optional(),
    shipping_address_id: z.number().optional(),
    billing_address: addressSchema.omit({ id: true }).optional(),
    payment_method: z.enum(['card', 'cod', 'paypal', 'razorpay']),
    same_as_billing: z.boolean().optional(),
});

// ============================================
// Type Exports (inferred from schemas)
// ============================================

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type Product = z.infer<typeof productSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Address = z.infer<typeof addressSchema>;
