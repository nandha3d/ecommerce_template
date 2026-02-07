/**
 * Configuration Validator
 * 
 * Validates that all required frontend configuration is present.
 * Application MUST fail fast if any required config is missing.
 */

export interface ConfigValidationResult {
    isValid: boolean;
    missing: string[];
    errors: string[];
}

/**
 * Required environment variables for the frontend application.
 * All VITE_* variables that the app depends on must be listed here.
 */
const REQUIRED_CONFIG = {
    // API Configuration
    VITE_API_URL: 'API URL for backend communication',
} as const;

/**
 * Optional environment variables with defaults.
 */
const OPTIONAL_CONFIG = {
    VITE_APP_NAME: 'ShopKart',
    VITE_CURRENCY_SYMBOL: '₹',
    VITE_DEFAULT_CURRENCY: 'INR',
} as const;

/**
 * Get environment variable value.
 * Returns undefined if not set or empty.
 */
function getEnvVar(key: string): string | undefined {
    const value = import.meta.env[key];

    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    // Handle string "undefined" or "null"
    if (typeof value === 'string' && ['undefined', 'null'].includes(value.toLowerCase())) {
        return undefined;
    }

    return String(value);
}

/**
 * Validate all required configuration.
 * Returns validation result with any missing config.
 */
export function validateConfig(): ConfigValidationResult {
    const missing: string[] = [];
    const errors: string[] = [];

    // Check required config
    for (const [key, description] of Object.entries(REQUIRED_CONFIG)) {
        const value = getEnvVar(key);

        if (!value) {
            missing.push(`${key} (${description})`);
        }
    }

    // Build result
    return {
        isValid: missing.length === 0,
        missing,
        errors,
    };
}

/**
 * Get configuration value with fallback to optional default.
 */
export function getConfig<K extends keyof typeof OPTIONAL_CONFIG>(
    key: K
): string {
    return getEnvVar(key) || OPTIONAL_CONFIG[key];
}

/**
 * Get required configuration value.
 * Throws if not set - use after validateConfig().
 */
export function getRequiredConfig<K extends keyof typeof REQUIRED_CONFIG>(
    key: K
): string {
    const value = getEnvVar(key);

    if (!value) {
        throw new Error(`Missing required config: ${key}`);
    }

    return value;
}

/**
 * Render fatal error UI when config validation fails.
 * This completely replaces the app with an error message.
 */
export function renderConfigError(result: ConfigValidationResult): void {
    const root = document.getElementById('root');

    if (!root) {
        console.error('FATAL: Could not find root element');
        return;
    }

    root.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
    ">
      <div style="
        max-width: 600px;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      ">
        <h1 style="
          color: #ff6b6b;
          margin: 0 0 1rem;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        ">
          ⚠️ Configuration Error
        </h1>
        
        <p style="
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 1.5rem;
          line-height: 1.6;
        ">
          The application cannot start because required configuration is missing.
          Please ensure all environment variables are properly set.
        </p>
        
        <div style="
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        ">
          <h2 style="
            color: #ffc107;
            font-size: 0.875rem;
            margin: 0 0 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">
            Missing Configuration:
          </h2>
          <ul style="
            margin: 0;
            padding: 0 0 0 1.25rem;
            color: rgba(255, 255, 255, 0.9);
          ">
            ${result.missing.map(item => `<li style="margin: 0.25rem 0;">${item}</li>`).join('')}
          </ul>
        </div>
        
        <p style="
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          margin: 0;
        ">
          Check your <code style="
            background: rgba(255, 255, 255, 0.1);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
          ">.env</code> file and restart the development server.
        </p>
      </div>
    </div>
  `;
}

/**
 * Initialize configuration validation.
 * Must be called before app renders.
 * Returns false if config is invalid (app should not render).
 */
export function initializeConfig(): boolean {
    const result = validateConfig();

    if (!result.isValid) {
        console.error('❌ Configuration validation failed:', result.missing);
        renderConfigError(result);
        return false;
    }

    console.log('✅ Configuration validated successfully');
    return true;
}
