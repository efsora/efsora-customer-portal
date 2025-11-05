/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<_Subject = any> {
    /**
     * Custom command to login via UI
     * @example cy.login('username', 'password')
     */
    login(username: string, password: string): Chainable<void>;

    /**
     * Custom command to login via API
     * @example cy.apiLogin('username', 'password')
     */
    apiLogin(username: string, password: string): Chainable<void>;

    /**
     * Get element by data-testid attribute
     * @example cy.getByTestId('submit-button')
     */
    getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Wait for API call to complete
     * @example cy.waitForApi('GET', '/users')
     */
    waitForApi(method: string, urlPattern: string): Chainable<any>;

    /**
     * Set local storage item
     * @example cy.setLocalStorage('key', 'value')
     */
    setLocalStorage(key: string, value: string): Chainable<void>;

    /**
     * Get local storage item
     * @example cy.getLocalStorage('key')
     */
    getLocalStorage(key: string): Chainable<string | null>;

    /**
     * Clear local storage
     * @example cy.clearLocalStorage()
     */
    clearLocalStorage(): Chainable<void>;

    /**
     * Set session storage item
     * @example cy.setSessionStorage('key', 'value')
     */
    setSessionStorage(key: string, value: string): Chainable<void>;

    /**
     * Get session storage item
     * @example cy.getSessionStorage('key')
     */
    getSessionStorage(key: string): Chainable<string | null>;

    /**
     * Wait for element to be visible with custom timeout
     * @example cy.waitForVisible('[data-testid="modal"]', 5000)
     */
    waitForVisible(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>;

    /**
     * Wait for element to disappear
     * @example cy.waitForDisappear('[data-testid="loading"]')
     */
    waitForDisappear(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>;

    /**
     * Type and blur (trigger onBlur event)
     * @example cy.typeAndBlur('[data-testid="input"]', 'value')
     */
    typeAndBlur(selector: string, value: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Upload file
     * @example cy.uploadFile('[data-testid="file-input"]', 'test-file.pdf', 'application/pdf')
     */
    uploadFile(selector: string, fileName: string, fileType: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Mock API response
     * @example cy.mockApi('GET', '/api/users', { fixture: 'users.json' })
     */
    mockApi(method: string, url: string, response: any, statusCode?: number): Chainable<void>;

    /**
     * Wait for multiple API calls
     * @example cy.waitForMultipleApis(['@getUsers', '@getPosts'])
     */
    waitForMultipleApis(aliases: string[]): Chainable<any>;

    /**
     * Scroll to element smoothly
     * @example cy.scrollToElement('[data-testid="footer"]')
     */
    scrollToElement(selector: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Check if element exists without failing
     * @example cy.elementExists('[data-testid="optional-element"]').then(exists => { ... })
     */
    elementExists(selector: string): Chainable<boolean>;
  }
}
