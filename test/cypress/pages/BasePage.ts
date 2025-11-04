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
  visit(): void {
    cy.visit(this.url);
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
  protected click(selector: string): void {
    this.getElement(selector).click();
  }

  /**
   * Click on an element by test id
   * @param testId - data-testid value
   */
  protected clickByTestId(testId: string): void {
    this.getByTestId(testId).click();
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
  ): void {
    this.getElement(selector).clear().type(text, options);
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
  ): void {
    this.getByTestId(testId).clear().type(text, options);
  }

  /**
   * Wait for an element to be visible
   * @param selector - CSS selector
   * @param timeout - Timeout in milliseconds
   */
  protected waitForElement(selector: string, timeout: number = 10000): void {
    this.getElement(selector).should('be.visible', { timeout });
  }

  /**
   * Wait for an element to not exist
   * @param selector - CSS selector
   * @param timeout - Timeout in milliseconds
   */
  protected waitForElementToDisappear(selector: string, timeout: number = 10000): void {
    this.getElement(selector).should('not.exist', { timeout });
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
  protected shouldContainText(selector: string, text: string): void {
    this.getElement(selector).should('contain.text', text);
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
  protected verifyUrl(expectedUrl: string | RegExp): void {
    if (typeof expectedUrl === 'string') {
      cy.url().should('include', expectedUrl);
    } else {
      cy.url().should('match', expectedUrl);
    }
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
  protected verifyTitle(expectedTitle: string): void {
    cy.title().should('equal', expectedTitle);
  }

  /**
   * Scroll to an element
   * @param selector - CSS selector
   */
  protected scrollToElement(selector: string): void {
    this.getElement(selector).scrollIntoView();
  }

  /**
   * Select an option from a dropdown
   * @param selector - CSS selector for the select element
   * @param value - Value to select
   */
  protected selectDropdown(selector: string, value: string): void {
    this.getElement(selector).select(value);
  }

  /**
   * Check a checkbox
   * @param selector - CSS selector
   */
  protected check(selector: string): void {
    this.getElement(selector).check();
  }

  /**
   * Uncheck a checkbox
   * @param selector - CSS selector
   */
  protected uncheck(selector: string): void {
    this.getElement(selector).uncheck();
  }

  /**
   * Wait for page to load
   */
  protected waitForPageLoad(): void {
    cy.document().should('have.property', 'readyState', 'complete');
  }

  /**
   * Take a screenshot
   * @param name - Screenshot name
   */
  protected takeScreenshot(name: string): void {
    cy.screenshot(name);
  }

  /**
   * Reload the page
   */
  protected reload(): void {
    cy.reload();
  }

  /**
   * Go back in browser history
   */
  protected goBack(): void {
    cy.go('back');
  }

  /**
   * Go forward in browser history
   */
  protected goForward(): void {
    cy.go('forward');
  }
}
