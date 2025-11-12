import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import {
  registerUserAndLogin,
  generateUniqueEmail,
} from '../api/authApi';
import { getApiUrl } from '../utils/envConfig';

describe('Login Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let testUserEmail: string;
  let testUserPassword: string;

  // Create test users before all tests
  before(() => {
    // Create a user for login tests
    testUserEmail = generateUniqueEmail('login-test');
    testUserPassword = 'TestPassword123!';

    registerUserAndLogin({
      name: 'Login Test User',
      email: testUserEmail,
      password: testUserPassword,
    });
  });

  beforeEach(() => {
    loginPage = new LoginPage();
    homePage = new HomePage();
    loginPage.visit();
  });

  it('should successfully login with valid credentials', () => {
    loginPage.verifyPageLoaded();
    loginPage.login(testUserEmail, testUserPassword);

    // Verify redirect to home page
    homePage.verifyPageLoaded();
    homePage.verifyUserLoggedIn();
  });

  it('should display error message with invalid credentials', () => {
    loginPage.verifyPageLoaded();
    loginPage.login('invalid@example.com', 'wrongpassword');

    // Verify error message is visible
    loginPage.verifyErrorMessageVisible();
  });

  it('should display error message when email is empty', () => {
    loginPage.verifyPageLoaded();
    loginPage.enterPassword(testUserPassword);
    loginPage.clickSignIn();

    // Verify error message for empty email
    loginPage.verifyEmailErrorVisible();
    loginPage.verifyEmailErrorContains('Email is required');
  });

  it('should display error message when password is empty', () => {
    loginPage.verifyPageLoaded();
    loginPage.enterEmail(testUserEmail);
    loginPage.clickSignIn();

    // Verify error message for empty password
    loginPage.verifyPasswordErrorVisible();
    loginPage.verifyPasswordErrorContains('Password is required');
  });

  it('should navigate to signup page', () => {
    loginPage.verifyPageLoaded();
    loginPage.clickSignUp();

    // Verify navigation to signup page
    cy.url().should('include', '/register');
  });

  it('should clear input fields', () => {
    loginPage.verifyPageLoaded();
    loginPage.enterEmail(testUserEmail);
    loginPage.enterPassword(testUserPassword);

    // Verify fields have values
    loginPage.getEmailValue().should('equal', testUserEmail);

    // Clear fields
    loginPage.clearEmail();
    loginPage.clearPassword();

    // Verify fields are empty
    loginPage.getEmailValue().should('equal', '');
    loginPage.getPasswordValue().should('equal', '');
  });

  it('should display loading text on submit button while signing in', () => {
    loginPage.verifyPageLoaded();
    loginPage.enterEmail(testUserEmail);
    loginPage.enterPassword(testUserPassword);
    loginPage.clickSignIn();

    // Verify loading state
    loginPage.verifySignInButtonLoading();
  });

  it('should display page title and form elements', () => {
    loginPage.verifyPageLoaded();
    loginPage.verifyPageTitle();
    loginPage.verifyEmailFieldVisible();
    loginPage.verifyPasswordFieldVisible();
    loginPage.verifySignUpLinkVisible();
  });

  // Cleanup test users after login tests complete
  after(() => {
    const apiUrl = getApiUrl();
    return cy
      .request({
        method: 'DELETE',
        url: `${apiUrl}/v1/test/cleanup-all`,
        body: { emailPatterns: ['login-test.%'] },
        failOnStatusCode: false,
      })
      .then((response) => {
        if (response.status === 200) {
          cy.log(
            `✓ Cleaned up ${response.body.data.deletedCount} login test users`,
          );
        } else {
          cy.log(`Cleanup error: ${response.body.message}`);
        }
      });
  });
});

describe('Signup Functionality', () => {
  let newUserEmail: string;
  let newUserPassword: string;
  let registerPage: any;

  beforeEach(() => {
    // Generate a new user that hasn't been registered yet
    newUserEmail = generateUniqueEmail('signup-test');
    newUserPassword = 'SignupPassword123!';

    registerPage = {
      visit: () => cy.visit('/register'),
      enterName: (name: string) => cy.get('[data-testid="register-form-name-input"]').type(name),
      enterEmail: (email: string) => cy.get('[data-testid="register-form-email-input"]').type(email),
      enterPassword: (password: string) =>
        cy.get('[data-testid="register-form-password-input"]').type(password),
      enterConfirmPassword: (password: string) =>
        cy.get('[data-testid="register-form-confirm-password-input"]').type(password),
      clickSignUp: () => cy.get('[data-testid="register-form-submit-button"]').click(),
      verifyPageLoaded: () =>
        cy.get('[data-testid="register-page-container"]').should('be.visible'),
    };
  });

  it('should successfully signup with valid credentials', () => {
    registerPage.visit();
    registerPage.verifyPageLoaded();

    registerPage.enterName('New Test User');
    registerPage.enterEmail(newUserEmail);
    registerPage.enterPassword(newUserPassword);
    registerPage.enterConfirmPassword(newUserPassword);
    registerPage.clickSignUp();

    // Verify redirect to home/login page or success message
    cy.url().should('include', '/', { timeout: 10000 });
  });

  it('should display validation error for empty fields', () => {
    registerPage.visit();
    registerPage.verifyPageLoaded();

    // Try to submit without entering any data
    registerPage.clickSignUp();

    // Verify errors are displayed
    cy.get('[data-testid="register-form-name-error"]').should('be.visible');
    cy.get('[data-testid="register-form-email-error"]').should('be.visible');
    cy.get('[data-testid="register-form-password-error"]').should('be.visible');
  });

  it('should display error when email already exists', () => {
    // Try to register with an email that was created in login tests
    registerPage.visit();
    registerPage.verifyPageLoaded();

    // Use an email that was already registered in the login tests
    registerPage.enterName('Another User');
    registerPage.enterEmail('testuser.dev@example.com'); // From dev.json config
    registerPage.enterPassword('SomePassword123!');
    registerPage.enterConfirmPassword('SomePassword123!');
    registerPage.clickSignUp();

    // Verify error message is displayed
    cy.get('[data-testid="register-form-error-alert"]').should('be.visible');
    cy.get('[data-testid="register-form-error-message"]').should(
      'contain',
      'Email already in use',
    );
  });

  it('should navigate to login page', () => {
    registerPage.visit();
    registerPage.verifyPageLoaded();

    cy.get('[data-testid="register-form-signin-link"]').click();
    cy.url().should('include', '/login');
  });

  // Cleanup test users after signup tests complete
  after(() => {
    const apiUrl = getApiUrl();
    return cy
      .request({
        method: 'DELETE',
        url: `${apiUrl}/v1/test/cleanup-all`,
        body: { emailPatterns: ['signup-test.%'] },
        failOnStatusCode: false,
      })
      .then((response) => {
        if (response.status === 200) {
          cy.log(
            `✓ Cleaned up ${response.body.data.deletedCount} signup test users`,
          );
        } else {
          cy.log(`Cleanup error: ${response.body.message}`);
        }
      });
  });
});
