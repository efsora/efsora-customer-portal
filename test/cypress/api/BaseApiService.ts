/**
 * BaseApiService - Abstract base class for all API services
 * Provides common functionality for API interactions using cy.request()
 */
export abstract class BaseApiService {
  protected baseUrl: string;
  protected headers: Record<string, string>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || Cypress.env('apiUrl') || '';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authorization token
   * @param token - Bearer token
   */
  protected setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  protected removeAuthToken(): void {
    delete this.headers['Authorization'];
  }

  /**
   * Set custom header
   * @param key - Header key
   * @param value - Header value
   */
  protected setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  /**
   * Remove custom header
   * @param key - Header key
   */
  protected removeHeader(key: string): void {
    delete this.headers[key];
  }

  /**
   * Build full URL
   * @param endpoint - API endpoint
   */
  protected buildUrl(endpoint: string): string {
    const cleanBase = this.baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${cleanBase}/${cleanEndpoint}`;
  }

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param queryParams - Query parameters
   * @param customHeaders - Custom headers for this request
   */
  protected get<T = any>(
    endpoint: string,
    queryParams?: Record<string, any>,
    customHeaders?: Record<string, string>
  ): Cypress.Chainable<Cypress.Response<T>> {
    const url = this.buildUrl(endpoint);
    return cy.request({
      method: 'GET',
      url,
      headers: { ...this.headers, ...customHeaders },
      qs: queryParams,
      failOnStatusCode: false,
    });
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param customHeaders - Custom headers for this request
   */
  protected post<T = any>(
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Cypress.Chainable<Cypress.Response<T>> {
    const url = this.buildUrl(endpoint);
    return cy.request({
      method: 'POST',
      url,
      headers: { ...this.headers, ...customHeaders },
      body,
      failOnStatusCode: false,
    });
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param customHeaders - Custom headers for this request
   */
  protected put<T = any>(
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Cypress.Chainable<Cypress.Response<T>> {
    const url = this.buildUrl(endpoint);
    return cy.request({
      method: 'PUT',
      url,
      headers: { ...this.headers, ...customHeaders },
      body,
      failOnStatusCode: false,
    });
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param customHeaders - Custom headers for this request
   */
  protected patch<T = any>(
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Cypress.Chainable<Cypress.Response<T>> {
    const url = this.buildUrl(endpoint);
    return cy.request({
      method: 'PATCH',
      url,
      headers: { ...this.headers, ...customHeaders },
      body,
      failOnStatusCode: false,
    });
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param customHeaders - Custom headers for this request
   */
  protected delete<T = any>(
    endpoint: string,
    customHeaders?: Record<string, string>
  ): Cypress.Chainable<Cypress.Response<T>> {
    const url = this.buildUrl(endpoint);
    return cy.request({
      method: 'DELETE',
      url,
      headers: { ...this.headers, ...customHeaders },
      failOnStatusCode: false,
    });
  }

  /**
   * Verify response status code
   * @param response - Cypress response
   * @param expectedStatus - Expected status code
   */
  public verifyStatus(response: Cypress.Response<any>, expectedStatus: number): void {
    expect(response.status).to.equal(expectedStatus);
  }

  /**
   * Verify response body contains specific property
   * @param response - Cypress response
   * @param property - Property name
   */
  public verifyResponseHasProperty(response: Cypress.Response<any>, property: string): void {
    expect(response.body).to.have.property(property);
  }

  /**
   * Verify response body property value
   * @param response - Cypress response
   * @param property - Property name
   * @param expectedValue - Expected value
   */
  public verifyResponseProperty(
    response: Cypress.Response<any>,
    property: string,
    expectedValue: any
  ): void {
    expect(response.body[property]).to.equal(expectedValue);
  }

  /**
   * Verify response body is an array
   * @param response - Cypress response
   */
  public verifyResponseIsArray(response: Cypress.Response<any>): void {
    expect(response.body).to.be.an('array');
  }

  /**
   * Verify response body array length
   * @param response - Cypress response
   * @param expectedLength - Expected array length (exact or min/max object)
   */
  public verifyArrayLength(
    response: Cypress.Response<any>,
    expectedLength: number | { min?: number; max?: number }
  ): void {
    if (typeof expectedLength === 'number') {
      expect(response.body).to.have.length(expectedLength);
    } else {
      if (expectedLength.min !== undefined) {
        expect(response.body.length).to.be.at.least(expectedLength.min);
      }
      if (expectedLength.max !== undefined) {
        expect(response.body.length).to.be.at.most(expectedLength.max);
      }
    }
  }

  /**
   * Verify response time
   * @param response - Cypress response
   * @param maxDuration - Maximum duration in milliseconds
   */
  public verifyResponseTime(response: Cypress.Response<any>, maxDuration: number): void {
    expect(response.duration).to.be.lessThan(maxDuration);
  }

  /**
   * Verify response header
   * @param response - Cypress response
   * @param headerName - Header name
   * @param expectedValue - Expected value
   */
  public verifyResponseHeader(
    response: Cypress.Response<any>,
    headerName: string,
    expectedValue: string
  ): void {
    expect(response.headers[headerName.toLowerCase()]).to.equal(expectedValue);
  }

  /**
   * Log response for debugging
   * @param response - Cypress response
   * @param label - Optional label
   */
  public logResponse(response: Cypress.Response<any>, label?: string): void {
    const logLabel = label ? `[${label}]` : '';
    cy.log(`${logLabel} Status: ${response.status}`);
    cy.log(`${logLabel} Body:`, JSON.stringify(response.body, null, 2));
  }
}
