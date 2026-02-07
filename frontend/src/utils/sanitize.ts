/**
 * XSS Sanitization Utilities
 * Prevents cross-site scripting attacks in user-generated content
 */

/**
 * HTML entities map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export const escapeHtml = (str: string): string => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
};

/**
 * Sanitize URL to prevent javascript: protocol attacks
 */
export const sanitizeUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return '';

    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
    if (dangerousProtocols.some(protocol => trimmed.startsWith(protocol))) {
        return '';
    }

    // Allow safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', '/'];
    if (safeProtocols.some(protocol => trimmed.startsWith(protocol)) || !trimmed.includes(':')) {
        return url;
    }

    return '';
};

/**
 * Strip all HTML tags from a string
 */
export const stripHtml = (html: string): string => {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>/g, '');
};

/**
 * Allowed HTML tags for rich text (whitelist approach)
 */
const ALLOWED_TAGS = new Set([
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'span', 'div',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);

/**
 * Allowed attributes for HTML tags (whitelist approach)
 */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
    a: new Set(['href', 'title', 'target', 'rel']),
    img: new Set(['src', 'alt', 'width', 'height']),
    '*': new Set(['class', 'id']),
};

/**
 * Sanitize HTML allowing only safe tags and attributes
 * For heavy-duty sanitization, consider using DOMPurify
 */
export const sanitizeHtml = (html: string): string => {
    if (!html || typeof html !== 'string') return '';

    // Create a temporary DOM to parse HTML
    if (typeof DOMParser === 'undefined') {
        // Server-side: just strip all tags
        return stripHtml(html);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const sanitizeNode = (node: Node): void => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tagName = element.tagName.toLowerCase();

            // Remove disallowed tags
            if (!ALLOWED_TAGS.has(tagName)) {
                element.remove();
                return;
            }

            // Remove disallowed attributes
            const allowedAttrs = new Set([
                ...(ALLOWED_ATTRS[tagName] || []),
                ...(ALLOWED_ATTRS['*'] || []),
            ]);

            Array.from(element.attributes).forEach(attr => {
                if (!allowedAttrs.has(attr.name)) {
                    element.removeAttribute(attr.name);
                }

                // Sanitize href attributes
                if (attr.name === 'href') {
                    const sanitized = sanitizeUrl(attr.value);
                    if (sanitized) {
                        element.setAttribute('href', sanitized);
                        // Add rel="noopener noreferrer" for external links
                        if (sanitized.startsWith('http')) {
                            element.setAttribute('rel', 'noopener noreferrer');
                        }
                    } else {
                        element.removeAttribute('href');
                    }
                }
            });
        }

        // Recursively sanitize children
        Array.from(node.childNodes).forEach(sanitizeNode);
    };

    sanitizeNode(doc.body);
    return doc.body.innerHTML;
};

/**
 * Safe JSON parse with error handling
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
};

export default {
    escapeHtml,
    sanitizeUrl,
    stripHtml,
    sanitizeHtml,
    safeJsonParse,
};
