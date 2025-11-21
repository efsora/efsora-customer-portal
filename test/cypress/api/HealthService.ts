/**
 * HealthService - API service for health check endpoints
 * Extends BaseApiService with health-specific methods
 */
import { BaseApiService } from './BaseApiService';

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime?: number;
  version?: string;
}

export class HealthService extends BaseApiService {
  constructor(baseUrl?: string) {
    // Health endpoint is at root level (/health), not under /api/v1
    // Extract base URL from apiUrl (remove /api/v1 suffix) or use provided baseUrl
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000/api/v1';
    const healthBaseUrl = apiUrl.replace(/\/api\/v1$/, '');
    super(baseUrl || healthBaseUrl);
  }

  /**
   * Check backend service health
   * Endpoint: GET /health (at root level, not under /api/v1)
   */
  public getHealth<T = HealthResponse>(): Cypress.Chainable<Cypress.Response<T>> {
    return this.get<T>('/health');
  }

  /**
   * Verify health check response
   * @param response - API response
   */
  public verifyHealthy(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 200);
    this.verifyResponseHasProperty(response, 'status');
    this.verifyResponseProperty(response, 'status', 'ok');
  }

  /**
   * Verify health response has timestamp
   * @param response - API response
   */
  public verifyHasTimestamp(response: Cypress.Response<any>): void {
    this.verifyResponseHasProperty(response, 'timestamp');
    expect(response.body.timestamp).to.be.a('string');
    // Verify it's a valid ISO 8601 datetime
    expect(new Date(response.body.timestamp).toISOString()).to.not.be.null;
  }

  /**
   * Verify health response time is acceptable
   * @param response - API response
   * @param maxDuration - Maximum acceptable duration in milliseconds
   */
  public verifyHealthResponseTime(response: Cypress.Response<any>, maxDuration: number = 1000): void {
    this.verifyResponseTime(response, maxDuration);
  }
}
