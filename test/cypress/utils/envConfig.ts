/**
 * Environment Configuration Utilities
 * Helper functions for managing environment variables and configuration
 */

/**
 * Get environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 */
export const getEnv = (key: string, defaultValue?: any): any => {
  return Cypress.env(key) ?? defaultValue;
};

/**
 * Get API URL from environment
 */
export const getApiUrl = (): string => {
  return getEnv('apiUrl', 'http://localhost:3000/api/v1');
};

/**
 * Get base URL from environment
 */
export const getBaseUrl = (): string => {
  return Cypress.config('baseUrl') || getEnv('baseUrl', 'http://localhost:3000');
};

/**
 * Get auth token from environment
 */
export const getAuthToken = (): string => {
  return getEnv('authToken', '');
};

/**
 * Get test user credentials
 */
export const getTestUser = (): { username: string; password: string; email: string } => {
  return (
    getEnv('testUser') || {
      username: 'testuser',
      password: 'testpass123',
      email: 'testuser@example.com',
    }
  );
};

/**
 * Get test admin credentials
 */
export const getTestAdmin = (): { username: string; password: string; email: string } => {
  return (
    getEnv('testAdmin') || {
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
    }
  );
};

/**
 * Get timeout values
 */
export const getTimeouts = (): { short: number; medium: number; long: number } => {
  return (
    getEnv('timeout') || {
      short: 5000,
      medium: 10000,
      long: 30000,
    }
  );
};

/**
 * Get retry configuration
 */
export const getRetries = (): { runMode: number; openMode: number } => {
  return (
    getEnv('retries') || {
      runMode: 2,
      openMode: 0,
    }
  );
};

/**
 * Check if running in CI environment
 */
export const isCI = (): boolean => {
  return Cypress.env('CI') === true || process.env.CI === 'true';
};

/**
 * Get current environment (dev, staging, prod)
 */
export const getCurrentEnvironment = (): string => {
  return getEnv('environment', 'dev');
};

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = (): boolean => {
  return getEnv('debug', false);
};

/**
 * Get viewport configuration
 */
export const getViewportConfig = (): { width: number; height: number } => {
  return {
    width: Cypress.config('viewportWidth') || 1280,
    height: Cypress.config('viewportHeight') || 720,
  };
};

/**
 * Build full API endpoint URL
 * @param endpoint - API endpoint path
 */
export const buildApiUrl = (endpoint: string): string => {
  const apiUrl = getApiUrl();
  const cleanBase = apiUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${cleanBase}/${cleanEndpoint}`;
};

/**
 * Build full page URL
 * @param path - Page path
 */
export const buildPageUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
};

/**
 * Log environment configuration (for debugging)
 */
export const logEnvConfig = (): void => {
  cy.log('Environment Configuration:');
  cy.log(`Base URL: ${getBaseUrl()}`);
  cy.log(`API URL: ${getApiUrl()}`);
  cy.log(`Environment: ${getCurrentEnvironment()}`);
  cy.log(`CI Mode: ${isCI()}`);
  cy.log(`Debug Mode: ${isDebugMode()}`);
};

/**
 * Validate required environment variables
 * @param requiredVars - Array of required variable keys
 */
export const validateEnvVars = (requiredVars: string[]): void => {
  const missing: string[] = [];

  requiredVars.forEach((varKey) => {
    if (!Cypress.env(varKey)) {
      missing.push(varKey);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Get feature flags
 */
export const getFeatureFlags = (): Record<string, boolean> => {
  return getEnv('featureFlags', {});
};

/**
 * Check if feature is enabled
 * @param featureName - Feature flag name
 */
export const isFeatureEnabled = (featureName: string): boolean => {
  const flags = getFeatureFlags();
  return flags[featureName] === true;
};
