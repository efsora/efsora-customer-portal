/**
 * BasePage - Abstract base class for all Page Objects
 * Provides common functionality and utilities for page interactions
 */
export abstract class BasePage {
  protected url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Navigate to the page
   */
  visit(): this {
    cy.visit(this.url);
    return this;
  }

  /**
   * Get an element by selector
   * @param selector - CSS selector or data-testid
   */
  protected getElement(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector);
  }

  /**
   * Get an element by data-testid attribute
   * @param testId - data-testid value
   */
  protected getByTestId(testId: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(`[data-testid="${testId}"]`);
  }

  /**
   * Get an element by text content
   * @param text - Text content to search for
   */
  protected getByText(text: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains(text) as any;
  }

  /**
   * Click on an element
   * @param selector - CSS selector
   */
  protected click(selector: string): this {
    this.getElement(selector).click();
    return this;
  }

  /**
   * Click on an element by test id
   * @param testId - data-testid value
   */
  protected clickByTestId(testId: string): this {
    this.getByTestId(testId).click();
    return this;
  }

  /**
   * Type text into an input field
   * @param selector - CSS selector
   * @param text - Text to type
   * @param options - Cypress type options
   */
  protected type(
    selector: string,
    text: string,
    options?: Partial<Cypress.TypeOptions>
  ): this {
    this.getElement(selector).clear().type(text, options);
    return this;
  }

  /**
   * Type text into an input field by test id
   * @param testId - data-testid value
   * @param text - Text to type
   * @param options - Cypress type options
   */
  protected typeByTestId(
    testId: string,
    text: string,
    options?: Partial<Cypress.TypeOptions>
  ): this {
    this.getByTestId(testId).clear().type(text, options);
    return this;
  }

  /**
   * Wait for an element to be visible
   * @param selector - CSS selector
   * @param timeout - Timeout in milliseconds
   */
  protected waitForElement(selector: string, timeout: number = 10000): this {
    this.getElement(selector).should('be.visible', { timeout });
    return this;
  }

  /**
   * Wait for an element to not exist
   * @param selector - CSS selector
   * @param timeout - Timeout in milliseconds
   */
  protected waitForElementToDisappear(selector: string, timeout: number = 10000): this {
    this.getElement(selector).should('not.exist', { timeout });
    return this;
  }

  /**
   * Check if an element is visible
   * @param selector - CSS selector
   */
  protected isVisible(selector: string): Cypress.Chainable<boolean> {
    return this.getElement(selector).should('be.visible').then(() => true);
  }

  /**
   * Check if an element contains specific text
   * @param selector - CSS selector
   * @param text - Expected text
   */
  protected shouldContainText(selector: string, text: string): this {
    this.getElement(selector).should('contain.text', text);
    return this;
  }

  /**
   * Get the current URL
   */
  protected getCurrentUrl(): Cypress.Chainable<string> {
    return cy.url();
  }

  /**
   * Verify the current URL
   * @param expectedUrl - Expected URL or URL pattern
   */
  protected verifyUrl(expectedUrl: string | RegExp): this {
    if (typeof expectedUrl === 'string') {
      cy.url().should('include', expectedUrl);
    } else {
      cy.url().should('match', expectedUrl);
    }
    return this;
  }

  /**
   * Get page title
   */
  protected getTitle(): Cypress.Chainable<string> {
    return cy.title();
  }

  /**
   * Verify page title
   * @param expectedTitle - Expected title
   */
  protected verifyTitle(expectedTitle: string): this {
    cy.title().should('equal', expectedTitle);
    return this;
  }

  /**
   * Scroll to an element
   * @param selector - CSS selector
   */
  protected scrollToElement(selector: string): this {
    this.getElement(selector).scrollIntoView();
    return this;
  }

  /**
   * Select an option from a dropdown
   * @param selector - CSS selector for the select element
   * @param value - Value to select
   */
  protected selectDropdown(selector: string, value: string): this {
    this.getElement(selector).select(value);
    return this;
  }

  /**
   * Check a checkbox
   * @param selector - CSS selector
   */
  protected check(selector: string): this {
    this.getElement(selector).check();
    return this;
  }

  /**
   * Uncheck a checkbox
   * @param selector - CSS selector
   */
  protected uncheck(selector: string): this {
    this.getElement(selector).uncheck();
    return this;
  }

  /**
   * Wait for page to load
   */
  protected waitForPageLoad(): this {
    cy.document().should('have.property', 'readyState', 'complete');
    return this;
  }

  /**
   * Take a screenshot
   * @param name - Screenshot name
   */
  protected takeScreenshot(name: string): this {
    cy.screenshot(name);
    return this;
  }

  /**
   * Reload the page
   */
  protected reload(): this {
    cy.reload();
    return this;
  }

  /**
   * Go back in browser history
   */
  protected goBack(): this {
    cy.go('back');
    return this;
  }

  /**
   * Go forward in browser history
   */
  protected goForward(): this {
    cy.go('forward');
    return this;
  }
}
