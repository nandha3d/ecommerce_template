import DOMPurify from 'dompurify';

/**
 * Configuration for HTML sanitization
 * 
 * ALLOWED_TAGS: Only these HTML tags will be permitted
 * ALLOWED_ATTR: Only these attributes will be permitted
 */
const SANITIZE_CONFIG = {
    ALLOWED_TAGS: [
        // Text formatting
        'p', 'br', 'strong', 'em', 'u', 'i', 'b',
        // Headings
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // Lists
        'ul', 'ol', 'li',
        // Links (but sanitized)
        'a',
        // Other safe elements
        'blockquote', 'code', 'pre',
        'div', 'span',
        // Tables
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: [
        'href',   // For links
        'class',  // For styling
        'id',     // For styling
        'target', // For links
        'rel',    // For links
    ],
    // Additional security settings
    ALLOW_DATA_ATTR: false,      // Block data-* attributes
    ALLOW_UNKNOWN_PROTOCOLS: false, // Block javascript: and data: URLs
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param dirty - Potentially unsafe HTML string
 * @returns Safe HTML string with malicious content removed
 */
export const sanitizeHtml = (dirty: string | undefined | null): string => {
    if (!dirty) {
        return '';
    }

    // Sanitize the HTML
    const clean = DOMPurify.sanitize(dirty, SANITIZE_CONFIG);

    return clean;
};

/**
 * Sanitize HTML for product descriptions (stricter rules)
 * 
 * @param dirty - Potentially unsafe HTML string
 * @returns Safe HTML string suitable for product descriptions
 */
export const sanitizeProductDescription = (dirty: string | undefined | null): string => {
    if (!dirty) {
        return '';
    }

    const strictConfig = {
        ...SANITIZE_CONFIG,
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u',
            'h1', 'h2', 'h3',
            'ul', 'ol', 'li',
        ],
        ALLOWED_ATTR: ['class'],
    };

    const clean = DOMPurify.sanitize(dirty, strictConfig);

    return clean;
};

/**
 * Hook for using sanitized HTML in React components
 * 
 * @param html - Potentially unsafe HTML string
 * @returns Object suitable for dangerouslySetInnerHTML
 */
export const useSanitizedHtml = (html: string | undefined | null) => {
    return { __html: sanitizeHtml(html) };
};

/**
 * Hook for using sanitized product descriptions
 */
export const useSanitizedProductDescription = (html: string | undefined | null) => {
    return { __html: sanitizeProductDescription(html) };
};
