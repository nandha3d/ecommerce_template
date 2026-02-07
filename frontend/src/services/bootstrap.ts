import { store } from '../store';
import { hydrateProduct } from '../store/slices/productSlice';

/**
 * Bootstrap the application with server-injected data.
 * This prevents double-fetching and improves Core Web Vitals.
 */
export const bootstrap = () => {
    // 1. Read injection from server
    const initialData = (window as any).__INITIAL_DATA__;

    // 2. Hydrate Store
    if (initialData) {
        console.log('🚀 Hydrating from server data:', initialData);

        // If it looks like a product (has slug/name), hydrate product slice
        if (initialData.slug && initialData.name) {
            store.dispatch(hydrateProduct(initialData));
        }

        // 3. Cleanup to prevent pollution
        delete (window as any).__INITIAL_DATA__;
    }
};
