/**
 * AuthService - API service for authentication endpoints
 * Extends BaseApiService with auth-specific methods
 */
import { BaseApiService } from './BaseApiService';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  traceId: string;
  error: null | { code: string; message: string };
  message: null | string;
  meta: null;
}

export class AuthService extends BaseApiService {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  /**
   * Register a new user
   * @param payload - Registration data (name, email, password)
   */
  public register<T = AuthResponse>(payload: RegisterPayload): Cypress.Chainable<Cypress.Response<T>> {
    return this.post<T>('/auth/register', payload);
  }

  /**
   * Login a user
   * @param payload - Login credentials (email, password)
   */
  public login<T = AuthResponse>(payload: LoginPayload): Cypress.Chainable<Cypress.Response<T>> {
    return this.post<T>('/auth/login', payload);
  }

  /**
   * Get current user profile (requires authentication)
   */
  public getProfile<T = any>(): Cypress.Chainable<Cypress.Response<T>> {
    return this.get<T>('/auth/profile');
  }

  /**
   * Get user by ID (requires authentication)
   * @param userId - The user ID to retrieve
   */
  public getUser<T = any>(userId: string): Cypress.Chainable<Cypress.Response<T>> {
    return this.get<T>(`/users/${userId}`);
  }

  /**
   * Logout current user (requires authentication)
   */
  public logout<T = any>(): Cypress.Chainable<Cypress.Response<T>> {
    return this.post<T>('/auth/logout');
  }

  /**
   * Refresh authentication token (requires authentication)
   */
  public refreshToken<T = any>(): Cypress.Chainable<Cypress.Response<T>> {
    return this.post<T>('/auth/refresh');
  }

  /**
   * Set bearer token for authenticated requests
   * @param token - JWT token
   */
  public setToken(token: string): void {
    this.setAuthToken(token);
  }

  /**
   * Clear bearer token
   */
  public clearToken(): void {
    this.removeAuthToken();
  }

  /**
   * Verify successful registration response
   * @param response - API response
   */
  public verifyRegistrationSuccess(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 201);
    this.verifyResponseHasProperty(response, 'success');
    this.verifyResponseProperty(response, 'success', true);
    this.verifyResponseHasProperty(response, 'data');
    expect(response.body.data).to.have.property('user');
    expect(response.body.data).to.have.property('token');
    expect(response.body.data.user).to.have.property('id');
    expect(response.body.data.user).to.have.property('email');
    expect(response.body.data.user).to.have.property('name');
    expect(response.body.data.token).to.be.a('string');
  }

  /**
   * Verify successful login response
   * @param response - API response
   */
  public verifyLoginSuccess(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 201);
    this.verifyResponseHasProperty(response, 'success');
    this.verifyResponseProperty(response, 'success', true);
    this.verifyResponseHasProperty(response, 'data');
    expect(response.body.data).to.have.property('user');
    expect(response.body.data).to.have.property('token');
    expect(response.body.data.user).to.have.property('id');
    expect(response.body.data.user).to.have.property('email');
    expect(response.body.data.user).to.have.property('name');
    expect(response.body.data.token).to.be.a('string');
  }

  /**
   * Verify failed authentication response (401)
   * @param response - API response
   */
  public verifyUnauthorized(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 401);
    this.verifyResponseHasProperty(response, 'success');
    this.verifyResponseProperty(response, 'success', false);
  }

  /**
   * Verify conflict response (duplicate email)
   * @param response - API response
   */
  public verifyConflict(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 409);
    this.verifyResponseHasProperty(response, 'success');
    this.verifyResponseProperty(response, 'success', false);
  }

  /**
   * Verify bad request response (validation error)
   * @param response - API response
   */
  public verifyBadRequest(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 400);
    this.verifyResponseHasProperty(response, 'success');
    this.verifyResponseProperty(response, 'success', false);
  }

  /**
   * Verify invalid credentials response (authentication failure - returns 400 due to error code pattern)
   * Note: Backend returns 400 for USER_INVALID_CREDENTIALS error code
   * @param response - API response
   */
  public verifyInvalidCredentials(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 400);
    this.verifyResponseHasProperty(response, 'success');
    this.verifyResponseProperty(response, 'success', false);
  }
}
