export interface VariantDimensions {
    length: string | number;
    breadth: string | number;
    height: string | number;
}

export interface VariantAttribute {
    name: string;
    value: string;
}

export interface GeneratedVariant {
    id: string | number;
    sku: string;
    attributes: VariantAttribute[];
    price: string | number;
    sale_price: string | number | null;
    cost_price: string | number | null;
    stock_quantity: number;
    is_active: boolean;
    images: string[];
    weight: string | number | null;
    length: string | number | null;
    breadth: string | number | null;
    height: string | number | null;
    manufacturer_code?: string;
    barcode?: string;
    low_stock_threshold?: number;
    // Keep dimensions for internal frontend structure if needed, but let's favor flat for now to match backend
    dimensions?: VariantDimensions;
}

export interface BuilderConfig {
    maxImagesPerVariant: number;
    maxDuplicateCount: number;
    allowedImageFormats: string[];
    maxImageSizeBytes: number;
    skuFormat: string;
    titleFormat: string;
    validationRules: {
        priceMinimum: number;
        stockMinimum: number;
        weightMinimum: number;
        dimensionsRequired: boolean;
    };
    fieldLabels: {
        cost: string;
        price: string;
        salePrice: string;
        stock: string;
        weight: string;
        length: string;
        breadth: string;
        height: string;
    };
}

export interface AttributeConfig {
    id: number;
    name: string;
    slug: string;
    type: string;
    options: AttributeValue[];
}

export interface AttributeValue {
    id: number;
    value: string;
}
