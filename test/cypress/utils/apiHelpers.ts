/**
 * API Helper Functions
 * Common utilities for API interactions
 */

/**
 * Build query string from object
 * @param params - Query parameters object
 */
export const buildQueryString = (params: Record<string, any>): string => {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * Parse JSON response safely
 * @param response - Response object
 */
export const parseJsonResponse = (response: any): any => {
  try {
    return typeof response === 'string' ? JSON.parse(response) : response;
  } catch (error) {
    cy.log('Failed to parse JSON response', error);
    return null;
  }
};

/**
 * Verify response status code
 * @param response - Cypress response
 * @param expectedStatus - Expected status code
 */
export const verifyStatusCode = (response: Cypress.Response<any>, expectedStatus: number): void => {
  expect(response.status).to.equal(expectedStatus);
};

/**
 * Verify response contains property
 * @param response - Cypress response
 * @param property - Property path (e.g., 'user.name')
 */
export const verifyResponseProperty = (response: Cypress.Response<any>, property: string): void => {
  const properties = property.split('.');
  let value = response.body;

  properties.forEach((prop) => {
    expect(value).to.have.property(prop);
    value = value[prop];
  });
};

/**
 * Verify response body structure
 * @param response - Cypress response
 * @param expectedStructure - Expected structure object
 */
export const verifyResponseStructure = (
  response: Cypress.Response<any>,
  expectedStructure: Record<string, string>
): void => {
  Object.keys(expectedStructure).forEach((key) => {
    const expectedType = expectedStructure[key];
    expect(response.body).to.have.property(key);
    expect(typeof response.body[key]).to.equal(expectedType);
  });
};

/**
 * Extract value from response
 * @param response - Cypress response
 * @param path - Path to value (e.g., 'data.user.id')
 */
export const extractValueFromResponse = (response: Cypress.Response<any>, path: string): any => {
  const properties = path.split('.');
  let value = response.body;

  properties.forEach((prop) => {
    value = value?.[prop];
  });

  return value;
};

/**
 * Verify response time is under threshold
 * @param response - Cypress response
 * @param maxDuration - Maximum duration in milliseconds
 */
export const verifyResponseTime = (response: Cypress.Response<any>, maxDuration: number): void => {
  expect(response.duration).to.be.lessThan(maxDuration);
};

/**
 * Verify response header
 * @param response - Cypress response
 * @param headerName - Header name
 * @param expectedValue - Expected value (optional)
 */
export const verifyHeader = (
  response: Cypress.Response<any>,
  headerName: string,
  expectedValue?: string
): void => {
  const headerKey = Object.keys(response.headers).find(
    (key) => key.toLowerCase() === headerName.toLowerCase()
  );

  expect(headerKey).to.not.equal(undefined);

  if (expectedValue) {
    expect(response.headers[headerKey!]).to.equal(expectedValue);
  }
};

/**
 * Verify response is array
 * @param response - Cypress response
 */
export const verifyResponseIsArray = (response: Cypress.Response<any>): void => {
  expect(response.body).to.be.an('array');
};

/**
 * Verify array length
 * @param response - Cypress response
 * @param expectedLength - Expected length (exact or min/max object)
 */
export const verifyArrayLength = (
  response: Cypress.Response<any>,
  expectedLength: number | { min?: number; max?: number }
): void => {
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
};

/**
 * Verify array contains item with property value
 * @param response - Cypress response
 * @param property - Property name
 * @param value - Expected value
 */
export const verifyArrayContains = (
  response: Cypress.Response<any>,
  property: string,
  value: any
): void => {
  expect(response.body).to.be.an('array');
  const found = response.body.some((item: any) => item[property] === value);
  expect(found).to.equal(true);
};

/**
 * Verify all array items have property
 * @param response - Cypress response
 * @param property - Property name
 */
export const verifyArrayItemsHaveProperty = (
  response: Cypress.Response<any>,
  property: string
): void => {
  expect(response.body).to.be.an('array');
  response.body.forEach((item: any) => {
    expect(item).to.have.property(property);
  });
};

/**
 * Create authorization header
 * @param token - Bearer token
 */
export const createAuthHeader = (token: string): Record<string, string> => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Create headers object
 * @param headers - Headers key-value pairs
 */
export const createHeaders = (headers: Record<string, string>): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    ...headers,
  };
};

/**
 * Make GET request with retry
 * @param url - API URL
 * @param retries - Number of retries
 * @param retryDelay - Delay between retries in ms
 */
export const getWithRetry = (
  url: string,
  retries: number = 3,
  retryDelay: number = 1000
): Cypress.Chainable<Cypress.Response<any>> => {
  return cy.request({
    method: 'GET',
    url,
    failOnStatusCode: false,
    retryOnStatusCodeFailure: true,
    timeout: retryDelay * retries,
  });
};

/**
 * Verify error response structure
 * @param response - Cypress response
 * @param expectedStatus - Expected error status code
 * @param messageField - Field name for error message (default: 'message')
 */
export const verifyErrorResponse = (
  response: Cypress.Response<any>,
  expectedStatus: number,
  messageField: string = 'message'
): void => {
  expect(response.status).to.equal(expectedStatus);
  expect(response.body).to.have.property(messageField);
};

/**
 * Log response details for debugging
 * @param response - Cypress response
 * @param label - Optional label
 */
export const logResponse = (response: Cypress.Response<any>, label?: string): void => {
  const prefix = label ? `[${label}]` : '';
  cy.log(`${prefix} Status: ${response.status}`);
  cy.log(`${prefix} Duration: ${response.duration}ms`);
  cy.log(`${prefix} Body:`, JSON.stringify(response.body, null, 2));
};

/**
 * Wait for async operation with polling
 * @param requestFn - Function that makes the request
 * @param condition - Condition function to check
 * @param maxAttempts - Maximum number of attempts
 * @param delay - Delay between attempts in ms
 */
export const pollUntil = (
  requestFn: () => Cypress.Chainable<Cypress.Response<any>>,
  condition: (response: Cypress.Response<any>) => boolean,
  maxAttempts: number = 10,
  delay: number = 1000
): Cypress.Chainable<Cypress.Response<any>> => {
  let attempts = 0;

  const poll = (): Cypress.Chainable<Cypress.Response<any>> => {
    return requestFn().then((response) => {
      attempts++;
      if (condition(response)) {
        return cy.wrap(response);
      } else if (attempts < maxAttempts) {
        cy.wait(delay);
        return poll();
      } else {
        throw new Error(`Polling failed after ${maxAttempts} attempts`);
      }
    });
  };

  return poll();
};

/**
 * Batch requests (execute multiple requests in parallel)
 * @param requests - Array of request configurations
 */
export const batchRequests = (
  requests: Array<{ method: string; url: string; body?: any }>
): Cypress.Chainable<Cypress.Response<any>[]> => {
  const promises = requests.map((req) =>
    cy.request({
      method: req.method,
      url: req.url,
      body: req.body,
      failOnStatusCode: false,
    })
  );

  return cy.wrap(Promise.all(promises));
};
