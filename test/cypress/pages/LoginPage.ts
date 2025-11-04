import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object for Login functionality
 * Extends BasePage to inherit common functionality
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly selectors = {
    usernameInput: '[data-testid="username"]',
    passwordInput: '[data-testid="password"]',
    loginButton: '[data-testid="login-button"]',
    errorMessage: '[data-testid="error-message"]',
    forgotPasswordLink: '[data-testid="forgot-password"]',
    signupLink: '[data-testid="signup-link"]',
    rememberMeCheckbox: '[data-testid="remember-me"]',
    showPasswordButton: '[data-testid="show-password"]',
  };

  constructor() {
    super('/login');
  }

  /**
   * Enter username
   * @param username - Username to enter
   */
  enterUsername(username: string): this {
    this.type(this.selectors.usernameInput, username);
    return this;
  }

  /**
   * Enter password
   * @param password - Password to enter
   */
  enterPassword(password: string): this {
    this.type(this.selectors.passwordInput, password);
    return this;
  }

  /**
   * Click login button
   */
  clickLoginButton(): this {
    this.click(this.selectors.loginButton);
    return this;
  }

  /**
   * Perform complete login
   * @param username - Username
   * @param password - Password
   */
  login(username: string, password: string): this {
    this.enterUsername(username);
    this.enterPassword(password);
    this.clickLoginButton();
    return this;
  }

  /**
   * Click forgot password link
   */
  clickForgotPassword(): this {
    this.click(this.selectors.forgotPasswordLink);
    return this;
  }

  /**
   * Click signup link
   */
  clickSignupLink(): this {
    this.click(this.selectors.signupLink);
    return this;
  }

  /**
   * Check remember me checkbox
   */
  checkRememberMe(): this {
    this.check(this.selectors.rememberMeCheckbox);
    return this;
  }

  /**
   * Toggle show/hide password
   */
  togglePasswordVisibility(): this {
    this.click(this.selectors.showPasswordButton);
    return this;
  }

  /**
   * Get error message text
   */
  getErrorMessage(): Cypress.Chainable<string> {
    return this.getElement(this.selectors.errorMessage).invoke('text');
  }

  /**
   * Verify error message is displayed
   * @param expectedMessage - Expected error message
   */
  verifyErrorMessage(expectedMessage: string): this {
    this.shouldContainText(this.selectors.errorMessage, expectedMessage);
    return this;
  }

  /**
   * Verify login page is loaded
   */
  verifyPageLoaded(): this {
    this.waitForElement(this.selectors.usernameInput);
    this.waitForElement(this.selectors.passwordInput);
    this.waitForElement(this.selectors.loginButton);
    return this;
  }

  /**
   * Verify login button is disabled
   */
  verifyLoginButtonDisabled(): this {
    this.getElement(this.selectors.loginButton).should('be.disabled');
    return this;
  }

  /**
   * Verify login button is enabled
   */
  verifyLoginButtonEnabled(): this {
    this.getElement(this.selectors.loginButton).should('be.enabled');
    return this;
  }

  /**
   * Clear username field
   */
  clearUsername(): this {
    this.getElement(this.selectors.usernameInput).clear();
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
   * Verify username field has value
   * @param expectedValue - Expected username value
   */
  verifyUsernameValue(expectedValue: string): this {
    this.getElement(this.selectors.usernameInput).should('have.value', expectedValue);
    return this;
  }
}
