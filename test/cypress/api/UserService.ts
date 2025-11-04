import { BaseApiService } from './BaseApiService';

/**
 * UserService - API service for user-related endpoints
 * Extends BaseApiService to inherit common HTTP methods
 */
export class UserService extends BaseApiService {
  private readonly endpoints = {
    users: '/users',
    user: (id: string | number) => `/users/${id}`,
    login: '/auth/login',
    register: '/auth/register',
    profile: '/users/profile',
    updateProfile: '/users/profile',
    deleteUser: (id: string | number) => `/users/${id}`,
  };

  /**
   * Get all users
   * @param queryParams - Optional query parameters (page, limit, etc.)
   */
  getAllUsers(queryParams?: Record<string, any>): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.users, queryParams);
  }

  /**
   * Get user by ID
   * @param userId - User ID
   */
  getUserById(userId: string | number): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.user(userId));
  }

  /**
   * Create new user
   * @param userData - User data
   */
  createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Cypress.Chainable<Cypress.Response<any>> {
    return this.post(this.endpoints.users, userData);
  }

  /**
   * Login user
   * @param credentials - Login credentials
   */
  loginUser(credentials: {
    username: string;
    password: string;
  }): Cypress.Chainable<Cypress.Response<any>> {
    return this.post(this.endpoints.login, credentials).then((response) => {
      // Store auth token if login is successful
      if (response.status === 200 && response.body.token) {
        this.setAuthToken(response.body.token);
      }
      return response;
    });
  }

  /**
   * Register new user
   * @param userData - Registration data
   */
  registerUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Cypress.Chainable<Cypress.Response<any>> {
    return this.post(this.endpoints.register, userData);
  }

  /**
   * Get user profile
   */
  getUserProfile(): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.profile);
  }

  /**
   * Update user profile
   * @param userData - Updated user data
   */
  updateUserProfile(userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    bio?: string;
  }): Cypress.Chainable<Cypress.Response<any>> {
    return this.put(this.endpoints.updateProfile, userData);
  }

  /**
   * Partially update user profile
   * @param userData - Partial user data
   */
  patchUserProfile(userData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
  }>): Cypress.Chainable<Cypress.Response<any>> {
    return this.patch(this.endpoints.updateProfile, userData);
  }

  /**
   * Update user by ID
   * @param userId - User ID
   * @param userData - Updated user data
   */
  updateUser(
    userId: string | number,
    userData: Record<string, any>
  ): Cypress.Chainable<Cypress.Response<any>> {
    return this.put(this.endpoints.user(userId), userData);
  }

  /**
   * Delete user by ID
   * @param userId - User ID
   */
  deleteUser(userId: string | number): Cypress.Chainable<Cypress.Response<any>> {
    return this.delete(this.endpoints.user(userId));
  }

  /**
   * Search users
   * @param searchTerm - Search term
   * @param filters - Optional filters
   */
  searchUsers(
    searchTerm: string,
    filters?: Record<string, any>
  ): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.users, {
      search: searchTerm,
      ...filters,
    });
  }

  /**
   * Verify user login response
   * @param response - API response
   */
  verifyLoginResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 200);
    this.verifyResponseHasProperty(response, 'token');
    this.verifyResponseHasProperty(response, 'user');
  }

  /**
   * Verify user creation response
   * @param response - API response
   */
  verifyUserCreationResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 201);
    this.verifyResponseHasProperty(response, 'id');
    this.verifyResponseHasProperty(response, 'username');
    this.verifyResponseHasProperty(response, 'email');
  }

  /**
   * Verify user list response
   * @param response - API response
   */
  verifyUserListResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 200);
    this.verifyResponseIsArray(response);
  }

  /**
   * Verify user details response
   * @param response - API response
   * @param expectedUsername - Expected username
   */
  verifyUserDetailsResponse(response: Cypress.Response<any>, expectedUsername?: string): void {
    this.verifyStatus(response, 200);
    this.verifyResponseHasProperty(response, 'id');
    this.verifyResponseHasProperty(response, 'username');
    this.verifyResponseHasProperty(response, 'email');

    if (expectedUsername) {
      this.verifyResponseProperty(response, 'username', expectedUsername);
    }
  }

  /**
   * Verify user deletion response
   * @param response - API response
   */
  verifyUserDeletionResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 200);
  }

  /**
   * Verify unauthorized response
   * @param response - API response
   */
  verifyUnauthorizedResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 401);
  }
}
