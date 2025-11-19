import { BasePage } from './BasePage';

/**
 * RegisterPage - Page Object for Registration functionality
 * Maps to frontend/src/presentation/components/auth/RegisterForm.tsx
 * Uses data-testid selectors for better test resilience
 */
export class RegisterPage extends BasePage {
  // Selectors using data-testid attributes
  // These correspond to elements in frontend/src/presentation/components/auth/RegisterForm.tsx
  private readonly selectors = {
    // Container elements
    pageContainer: '[data-testid="register-page-container"]',
    formWrapper: '[data-testid="register-form-wrapper"]',
    form: '[data-testid="register-form"]',

    // Title
    title: '[data-testid="register-form-title"]',

    // Error handling
    errorAlert: '[data-testid="register-form-error-alert"]',
    errorMessage: '[data-testid="register-form-error-message"]',

    // Name field
    nameField: '[data-testid="register-form-name-field"]',
    nameInput: '[data-testid="register-form-name-input"]',
    nameError: '[data-testid="register-form-name-error"]',

    // Surname field
    surnameInput: '#surname',

    // Email field
    emailField: '[data-testid="register-form-email-field"]',
    emailInput: '[data-testid="register-form-email-input"]',
    emailError: '[data-testid="register-form-email-error"]',

    // Password field
    passwordField: '[data-testid="register-form-password-field"]',
    passwordInput: '[data-testid="register-form-password-input"]',
    passwordError: '[data-testid="register-form-password-error"]',

    // Confirm password field
    confirmPasswordField: '[data-testid="register-form-confirm-password-field"]',
    confirmPasswordInput: '[data-testid="register-form-confirm-password-input"]',
    confirmPasswordError: '[data-testid="register-form-confirm-password-error"]',

    // Submit button
    submitContainer: '[data-testid="register-form-submit-container"]',
    submitButton: '[data-testid="register-form-submit-button"]',

    // Signin section
    signInSection: '[data-testid="register-form-signin-section"]',
    signInLink: '[data-testid="register-form-signin-link"]',
  };

  constructor() {
    super('/register');
  }

  /**
   * Enter full name
   */
  enterName(name: string): this {
    this.type(this.selectors.nameInput, name);
    return this;
  }

  /**
   * Enter surname
   */
  enterSurname(surname: string): this {
    this.type(this.selectors.surnameInput, surname);
    return this;
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
   * Enter confirm password
   */
  enterConfirmPassword(password: string): this {
    this.type(this.selectors.confirmPasswordInput, password);
    return this;
  }

  /**
   * Click create account button
   */
  clickCreateAccount(): this {
    this.click(this.selectors.submitButton);
    return this;
  }

  /**
   * Perform complete registration flow
   */
  register(name: string, surname: string, email: string, password: string): this {
    this.enterName(name);
    this.enterSurname(surname);
    this.enterEmail(email);
    this.enterPassword(password);
    this.enterConfirmPassword(password);
    this.clickCreateAccount();
    return this;
  }

  /**
   * Click sign in link
   */
  clickSignIn(): this {
    this.click(this.selectors.signInLink);
    return this;
  }

  /**
   * Verify registration page is loaded
   */
  verifyPageLoaded(): this {
    this.waitForElement(this.selectors.pageContainer);
    this.waitForElement(this.selectors.nameInput);
    this.waitForElement(this.selectors.emailInput);
    this.waitForElement(this.selectors.passwordInput);
    this.waitForElement(this.selectors.confirmPasswordInput);
    return this;
  }

  /**
   * Verify error message is displayed
   */
  verifyErrorMessageVisible(): this {
    this.waitForElement(this.selectors.errorAlert);
    return this;
  }

  /**
   * Get error message text
   */
  getErrorMessage(): Cypress.Chainable<string> {
    return this.getElement(this.selectors.errorMessage).invoke('text');
  }

  /**
   * Verify name error is displayed
   */
  verifyNameErrorVisible(): this {
    this.waitForElement(this.selectors.nameError);
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
   * Verify password error is displayed
   */
  verifyPasswordErrorVisible(): this {
    this.waitForElement(this.selectors.passwordError);
    return this;
  }

  /**
   * Verify confirm password error is displayed
   */
  verifyConfirmPasswordErrorVisible(): this {
    this.waitForElement(this.selectors.confirmPasswordError);
    return this;
  }

  /**
   * Verify create account button is disabled
   */
  verifyCreateAccountButtonDisabled(): this {
    this.getElement(this.selectors.submitButton).should('be.disabled');
    return this;
  }

  /**
   * Verify create account button is enabled
   */
  verifyCreateAccountButtonEnabled(): this {
    this.getElement(this.selectors.submitButton).should('be.enabled');
    return this;
  }

  /**
   * Clear all form fields
   */
  clearForm(): this {
    this.getElement(this.selectors.nameInput).clear();
    this.getElement(this.selectors.emailInput).clear();
    this.getElement(this.selectors.passwordInput).clear();
    this.getElement(this.selectors.confirmPasswordInput).clear();
    return this;
  }
}
