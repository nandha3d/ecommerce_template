export type LayoutVariant = 1 | 2 | 3 | 4 | 5;

export interface StoreLayoutSettings {
    home: LayoutVariant;
    productDetail: LayoutVariant;
    cart: LayoutVariant;
    checkout: LayoutVariant;
}

export const STORE_LAYOUT_STORAGE_KEY = 'store_layout_settings_v1';

export const DEFAULT_STORE_LAYOUT_SETTINGS: StoreLayoutSettings = {
    home: 1,
    productDetail: 1,
    cart: 1,
    checkout: 1,
};

export const isLayoutVariant = (v: unknown): v is LayoutVariant => {
    return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
};

export const safeParseStoreLayoutSettings = (raw: string | null): StoreLayoutSettings | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as Partial<StoreLayoutSettings>;
        if (!parsed || typeof parsed !== 'object') return null;

        const next: StoreLayoutSettings = {
            ...DEFAULT_STORE_LAYOUT_SETTINGS,
            home: isLayoutVariant(parsed.home) ? parsed.home : DEFAULT_STORE_LAYOUT_SETTINGS.home,
            productDetail: isLayoutVariant(parsed.productDetail) ? parsed.productDetail : DEFAULT_STORE_LAYOUT_SETTINGS.productDetail,
            cart: isLayoutVariant(parsed.cart) ? parsed.cart : DEFAULT_STORE_LAYOUT_SETTINGS.cart,
            checkout: isLayoutVariant(parsed.checkout) ? parsed.checkout : DEFAULT_STORE_LAYOUT_SETTINGS.checkout,
        };

        return next;
    } catch {
        return null;
    }
};
