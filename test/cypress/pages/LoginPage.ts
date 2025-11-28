import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object for Login functionality
 * Maps to frontend/src/presentation/components/auth/LoginForm.tsx
 * Uses data-testid selectors for better test resilience
 */
export class LoginPage extends BasePage {
  // Selectors using data-testid attributes
  // These correspond to elements in frontend/src/presentation/components/auth/LoginForm.tsx
  private readonly selectors = {
    // Container elements
    pageContainer: '[data-testid="login-page-container"]',
    formWrapper: '[data-testid="login-form-wrapper"]',
    form: '[data-testid="login-form"]',

    // Title
    title: '[data-testid="login-form-title"]',

    // Error handling
    errorAlert: '[data-testid="login-form-error-alert"]',
    errorMessage: '[data-testid="login-form-error-message"]',

    // Email field
    emailField: '[data-testid="login-form-email-field"]',
    emailInput: '[data-testid="login-form-email-input"]',
    emailError: '[data-testid="login-form-email-error"]',

    // Password field
    passwordField: '[data-testid="login-form-password-field"]',
    passwordInput: '[data-testid="login-form-password-input"]',
    passwordError: '[data-testid="login-form-password-error"]',

    // Submit button
    submitContainer: '[data-testid="login-form-submit-container"]',
    submitButton: '[data-testid="login-form-submit-button"]',
  };

  constructor() {
    super('/login');
  }

  /**
   * Enter email address
   */
  enterEmail(email: string): this {
    this.type(this.selectors.emailInput, email);
    return this;
  }

  /**
   * Enter password
   */
  enterPassword(password: string): this {
    this.type(this.selectors.passwordInput, password);
    return this;
  }

  /**
   * Click sign in button
   */
  clickSignIn(): this {
    this.click(this.selectors.submitButton);
    return this;
  }

  /**
   * Perform complete login flow
   */
  login(email: string, password: string): this {
    this.enterEmail(email);
    this.enterPassword(password);
    this.clickSignIn();
    return this;
  }

  /**
   * Wait for login to complete (URL changes from /login)
   */
  waitForLoginSuccess(timeout: number = 10000): this {
    cy.url().should('not.include', '/login', { timeout });
    return this;
  }

  /**
   * Perform complete login flow and wait for success
   */
  loginAndWait(email: string, password: string, timeout: number = 10000): this {
    this.login(email, password);
    this.waitForLoginSuccess(timeout);
    return this;
  }

  /**
   * Get error message text
   */
  getErrorMessage(): Cypress.Chainable<string> {
    return this.getElement(this.selectors.errorMessage).invoke('text');
  }

  /**
   * Verify error message is visible
   */
  verifyErrorMessageVisible(): this {
    this.waitForElement(this.selectors.errorAlert);
    return this;
  }

  /**
   * Verify error message contains specific text
   */
  verifyErrorMessageContains(expectedText: string): this {
    this.shouldContainText(this.selectors.errorMessage, expectedText);
    return this;
  }

  /**
   * Verify login page is loaded
   */
  verifyPageLoaded(): this {
    // Wait for page container first
    this.waitForElement(this.selectors.pageContainer);
    // Wait for form wrapper
    this.waitForElement(this.selectors.formWrapper);
    // Wait for title
    this.waitForElement(this.selectors.title);
    // Wait for email input
    this.waitForElement(this.selectors.emailInput);
    // Wait for password input
    this.waitForElement(this.selectors.passwordInput);
    // Wait for submit button
    this.waitForElement(this.selectors.submitButton);
    return this;
  }

  /**
   * Verify page title is displayed
   */
  verifyPageTitle(): this {
    this.waitForElement(this.selectors.title);
    this.shouldContainText(this.selectors.title, 'Sign in to your account');
    return this;
  }

  /**
   * Verify email field is visible
   */
  verifyEmailFieldVisible(): this {
    this.waitForElement(this.selectors.emailField);
    return this;
  }

  /**
   * Verify password field is visible
   */
  verifyPasswordFieldVisible(): this {
    this.waitForElement(this.selectors.passwordField);
    return this;
  }

  /**
   * Clear email field
   */
  clearEmail(): this {
    this.getElement(this.selectors.emailInput).clear();
    return this;
  }

  /**
   * Clear password field
   */
  clearPassword(): this {
    this.getElement(this.selectors.passwordInput).clear();
    return this;
  }

  /**
   * Verify email error is displayed
   */
  verifyEmailErrorVisible(): this {
    this.waitForElement(this.selectors.emailError);
    return this;
  }

  /**
   * Verify email error contains specific text
   */
  verifyEmailErrorContains(expectedText: string): this {
    this.shouldContainText(this.selectors.emailError, expectedText);
    return this;
  }

  /**
   * Verify password error is displayed
   */
  verifyPasswordErrorVisible(): this {
    this.waitForElement(this.selectors.passwordError);
    return this;
  }

  /**
   * Verify password error contains specific text
   */
  verifyPasswordErrorContains(expectedText: string): this {
    this.shouldContainText(this.selectors.passwordError, expectedText);
    return this;
  }

  /**
   * Verify sign in button is disabled
   */
  verifySignInButtonDisabled(): this {
    this.getElement(this.selectors.submitButton).should('be.disabled');
    return this;
  }

  /**
   * Verify sign in button is enabled
   */
  verifySignInButtonEnabled(): this {
    this.getElement(this.selectors.submitButton).should('be.enabled');
    return this;
  }

  /**
   * Verify sign in button contains loading text
   */
  verifySignInButtonLoading(): this {
    this.getElement(this.selectors.submitButton).should('contain', 'Signing in...');
    return this;
  }

  /**
   * Get email input value
   */
  getEmailValue(): Cypress.Chainable<string> {
    return this.getElement(this.selectors.emailInput).invoke('val') as Cypress.Chainable<string>;
  }

  /**
   * Get password input value
   */
  getPasswordValue(): Cypress.Chainable<string> {
    return this.getElement(this.selectors.passwordInput).invoke('val') as Cypress.Chainable<string>;
  }
}
