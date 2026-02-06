
/**
 * Generates a flag emoji from a currency code.
 * Strictly dynamic: No hardcoded mapping of currency->country.
 * Uses the first 2 letters of the currency code to generate the Regional Indicator Symbols.
 */
export const getCurrencyFlag = (currencyCode: string): string => {
    if (!currencyCode || currencyCode.length < 2) return '';
    const countryCode = currencyCode.substring(0, 2).toUpperCase();
    const codePointOffset = 127397;
    const char1 = countryCode.charCodeAt(0) + codePointOffset;
    const char2 = countryCode.charCodeAt(1) + codePointOffset;
    return String.fromCodePoint(char1) + String.fromCodePoint(char2);
};

/**
 * Generates a reliable Flag Image URL using a CDN.
 * Since Windows often fails to render Flag Emojis (showing 'US', 'IN' instead of flags),
 * we use a CDN for consistent visual flags.
 * 
 * Logic:
 * USD -> us -> https://flagcdn.com/w40/us.png
 * EUR -> eu -> https://flagcdn.com/w40/eu.png
 * INR -> in -> https://flagcdn.com/w40/in.png
 */
export const getFlagUrl = (currencyCode: string): string => {
    if (!currencyCode || currencyCode.length < 2) return '';
    // Use first 2 letters, lowercase
    const countryCode = currencyCode.substring(0, 2).toLowerCase();
    return `https://flagcdn.com/w40/${countryCode}.png`;
};
