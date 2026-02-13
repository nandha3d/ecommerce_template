export interface Image {
    id: number;
    url: string;
    is_primary: boolean;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface Brand {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
}

export interface AttributeOption {
    id: number;
    attribute_id: number;
    value: string;
    price_modifier?: number;
}

export interface Attribute {
    id: number;
    name: string;
    slug: string;
    type: 'text' | 'color' | 'image' | 'select' | 'button' | 'radio';
    options?: AttributeOption[];
    options_count?: number;
    is_active: boolean;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku: string;
    price: number;
    sale_price?: number;
    stock_quantity: number;
    attributes?: Record<string, string>;
    name?: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    description?: string;
    short_description?: string;
    price: number;
    sale_price?: number;
    stock_quantity: number;
    is_active: boolean;
    brand?: Brand;
    categories?: Category[];
    images?: Image[];
    variants?: ProductVariant[];
}

export interface APIResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
