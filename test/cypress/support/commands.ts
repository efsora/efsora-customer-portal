/// <reference types="cypress" />

/**
 * Custom Cypress Commands
 * Add custom commands to extend Cypress functionality
 */

/**
 * Login command - customize based on your authentication flow
 * @example cy.login('username', 'password')
 */
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session([username, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="username"]').type(username);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('not.include', '/login');
  });
});

/**
 * API login command - for API-based authentication
 * @example cy.apiLogin('username', 'password')
 */
Cypress.Commands.add('apiLogin', (username: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { username, password },
  }).then((response) => {
    expect(response.status).to.equal(200);
    // Store token in session storage or local storage
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', response.body.token);
    });
  });
});

/**
 * Get element by data-testid attribute
 * @example cy.getByTestId('submit-button')
 */
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

/**
 * Wait for API call to complete
 * @example cy.waitForApi('GET', '/users')
 */
Cypress.Commands.add('waitForApi', (method: string, urlPattern: string) => {
  cy.intercept(method, urlPattern).as('apiCall');
  return cy.wait('@apiCall');
});

/**
 * Set local storage item
 * @example cy.setLocalStorage('key', 'value')
 */
Cypress.Commands.add('setLocalStorage', (key: string, value: string) => {
  cy.window().then((window) => {
    window.localStorage.setItem(key, value);
  });
});

/**
 * Get local storage item
 * @example cy.getLocalStorage('key')
 */
Cypress.Commands.add('getLocalStorage', (key: string) => {
  return cy.window().then((window) => {
    return window.localStorage.getItem(key);
  }) as any;
});

/**
 * Clear local storage (overwrite built-in command)
 * @example cy.clearLocalStorage()
 */
Cypress.Commands.overwrite('clearLocalStorage', (originalFn) => {
  return cy.window().then((window) => {
    window.localStorage.clear();
  });
});

/**
 * Set session storage item
 * @example cy.setSessionStorage('key', 'value')
 */
Cypress.Commands.add('setSessionStorage', (key: string, value: string) => {
  cy.window().then((window) => {
    window.sessionStorage.setItem(key, value);
  });
});

/**
 * Get session storage item
 * @example cy.getSessionStorage('key')
 */
Cypress.Commands.add('getSessionStorage', (key: string) => {
  return cy.window().then((window) => {
    return window.sessionStorage.getItem(key);
  }) as any;
});

/**
 * Wait for element to be visible with custom timeout
 * @example cy.waitForVisible('[data-testid="modal"]', 5000)
 */
Cypress.Commands.add('waitForVisible', (selector: string, timeout: number = 10000) => {
  return cy.get(selector, { timeout }).should('be.visible');
});

/**
 * Wait for element to disappear
 * @example cy.waitForDisappear('[data-testid="loading"]')
 */
Cypress.Commands.add('waitForDisappear', (selector: string, timeout: number = 10000) => {
  return cy.get(selector, { timeout }).should('not.exist');
});

/**
 * Type and blur (trigger onBlur event)
 * @example cy.typeAndBlur('[data-testid="input"]', 'value')
 */
Cypress.Commands.add('typeAndBlur', (selector: string, value: string) => {
  cy.get(selector).clear();
  cy.get(selector).type(value);
  return cy.get(selector).blur();
});

/**
 * Upload file
 * @example cy.uploadFile('[data-testid="file-input"]', 'test-file.pdf', 'application/pdf')
 */
Cypress.Commands.add('uploadFile', (selector: string, fileName: string, fileType: string) => {
  return cy.get(selector).selectFile({
    contents: Cypress.Buffer.from('file contents'),
    fileName,
    mimeType: fileType,
  });
});

/**
 * Mock API response
 * @example cy.mockApi('GET', '/api/users', { fixture: 'users.json' })
 */
Cypress.Commands.add(
  'mockApi',
  (method: string, url: string, response: any, statusCode: number = 200) => {
    cy.intercept(method as any, url, {
      statusCode,
      body: response,
    });
  }
);

/**
 * Wait for multiple API calls
 * @example cy.waitForMultipleApis(['@getUsers', '@getPosts'])
 */
Cypress.Commands.add('waitForMultipleApis', (aliases: string[]) => {
  return cy.wait(aliases);
});

/**
 * Scroll to element smoothly
 * @example cy.scrollToElement('[data-testid="footer"]')
 */
Cypress.Commands.add('scrollToElement', (selector: string) => {
  return cy.get(selector).scrollIntoView({ duration: 500 });
});

/**
 * Check if element exists without failing
 * @example cy.elementExists('[data-testid="optional-element"]').then(exists => { ... })
 */
Cypress.Commands.add('elementExists', (selector: string) => {
  return cy.get('body').then(($body) => {
    return $body.find(selector).length > 0;
  });
});

/**
 * Link test case ID from Qase
 * @example cy.qaseId(123)
 */
Cypress.Commands.add('qaseId', (caseId: number) => {
  cy.log(`Linking Qase test case: ${caseId}`);
  return cy.task('log', `@qaseId ${caseId}`);
});
