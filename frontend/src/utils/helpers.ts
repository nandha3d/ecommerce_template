/**
 * Utility functions for the application
 */

/**
 * Get full image URL by prepending backend domain to relative paths
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '/placeholder-product.jpg';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${baseUrl}${path}`;
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};
