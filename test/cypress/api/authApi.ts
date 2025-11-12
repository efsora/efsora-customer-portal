/**
 * Auth API Helper for Cypress Tests
 * Provides methods to register and login users via the backend API
 */

import { getApiUrl } from '../utils/envConfig';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/**
 * Register a new user via API
 * @param user - User registration data (name, email, password)
 * @returns Promise with token and user data
 */
export const registerUser = (user: RegisterPayload): Cypress.Chainable<any> => {
  const apiUrl = getApiUrl();
  const registerUrl = `${apiUrl}/v1/auth/register`;

  return cy.request({
    method: 'POST',
    url: registerUrl,
    body: user,
    failOnStatusCode: false,
  });
};

/**
 * Login a user via API
 * @param email - User email
 * @param password - User password
 * @returns Promise with token and user data
 */
export const loginUser = (
  email: string,
  password: string,
): Cypress.Chainable<any> => {
  const apiUrl = getApiUrl();
  const loginUrl = `${apiUrl}/v1/auth/login`;

  return cy.request({
    method: 'POST',
    url: loginUrl,
    body: { email, password },
    failOnStatusCode: false,
  });
};

/**
 * Register a user and store token in localStorage for authenticated requests
 * Automatically tracks created user for cleanup
 * @param user - User registration data
 * @param storageKey - Key to store token in localStorage (default: 'authToken')
 */
export const registerUserAndLogin = (
  user: RegisterPayload,
  storageKey: string = 'authToken',
): Cypress.Chainable<any> => {
  return registerUser(user).then((response: any) => {
    // Accept both 200 (OK) and 201 (Created) as successful registration
    expect([200, 201]).to.include(response.status);
    expect(response.body.success).to.be.true;

    const token = response.body.data.token;
    const userId = response.body.data.id;

    // Track user for cleanup
    trackCreatedUser(userId);

    // Return the cy.window chain properly to avoid mixing sync/async
    return cy.window().then((win) => {
      win.localStorage.setItem(storageKey, token);
      return response.body;
    });
  });
};

/**
 * Login a user and store token in localStorage for authenticated requests
 * Automatically tracks created user for cleanup
 * @param email - User email
 * @param password - User password
 * @param storageKey - Key to store token in localStorage (default: 'authToken')
 */
export const loginUserAndStoreToken = (
  email: string,
  password: string,
  storageKey: string = 'authToken',
): Cypress.Chainable<any> => {
  return loginUser(email, password).then((response: any) => {
    expect([200, 201]).to.include(response.status);
    expect(response.body.success).to.be.true;

    const token = response.body.data.token;
    const userId = response.body.data.user?.id;

    // Track user for cleanup if it's a new registration
    if (userId) {
      trackCreatedUser(userId);
    }

    // Return the cy.window chain properly to avoid mixing sync/async
    return cy.window().then((win) => {
      win.localStorage.setItem(storageKey, token);
      return response.body;
    });
  });
};

/**
 * Generate a unique email for testing
 * @param prefix - Prefix for email (default: 'testuser')
 * @returns Unique email string
 */
export const generateUniqueEmail = (prefix: string = 'testuser'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}.${timestamp}.${random}@example.com`;
};

/**
 * Cleanup test users by their IDs
 * Only works in development environment
 * @param userIds - Array of user IDs to delete
 * @returns Cypress chainable with cleanup response
 */
export const cleanupTestUsers = (
  userIds: string[]
): Cypress.Chainable<any> => {
  if (userIds.length === 0) {
    return cy.log('No users to cleanup').then(() => ({
      success: true,
      deletedCount: 0,
    }));
  }

  const apiUrl = getApiUrl();
  const cleanupUrl = `${apiUrl}/v1/test/cleanup`;

  return cy
    .log(`Starting cleanup for ${userIds.length} users`)
    .then(() =>
      cy.request({
        method: 'DELETE',
        url: cleanupUrl,
        body: { userIds },
        failOnStatusCode: false,
      })
    )
    .then((response) => {
      const message =
        response.status === 200
          ? `✓ Cleaned up ${response.body.data.deletedCount} test users successfully`
          : `✗ Cleanup failed (${response.status}): ${response.body.message || JSON.stringify(response.body)}`;
      return cy.log(message).then(() => response);
    });
};

/**
 * Global tracker for created users in current test run
 * Used for cleanup after tests complete
 */
let createdUserIds: string[] = [];

/**
 * Get the list of created user IDs
 */
export const getCreatedUserIds = (): string[] => {
  return createdUserIds;
};

/**
 * Add a user ID to the created users list
 */
export const trackCreatedUser = (userId: string): void => {
  createdUserIds.push(userId);
};

/**
 * Clear the created users list
 */
export const clearCreatedUserIds = (): void => {
  createdUserIds = [];
};
