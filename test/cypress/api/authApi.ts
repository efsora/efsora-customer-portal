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
  const registerUrl = `${apiUrl}/auth/register`;

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
  const loginUrl = `${apiUrl}/auth/login`;

  return cy.request({
    method: 'POST',
    url: loginUrl,
    body: { email, password },
    failOnStatusCode: false,
  });
};

/**
 * Register a user and store token in localStorage for authenticated requests
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

    // Return the cy.window chain properly to avoid mixing sync/async
    return cy.window().then((win) => {
      win.localStorage.setItem(storageKey, token);
      return response.body;
    });
  });
};

/**
 * Login a user and store token in localStorage for authenticated requests
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

