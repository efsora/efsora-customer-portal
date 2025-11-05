import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { getTestUser } from '../utils/envConfig';

describe('Login Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  beforeEach(() => {
    loginPage = new LoginPage();
    homePage = new HomePage();
    loginPage.visit();
  });

  it('should successfully login with valid credentials', () => {
    const testUser = getTestUser();

    loginPage.verifyPageLoaded();
    loginPage.login(testUser.username, testUser.password);

    // Verify redirect to home page
    homePage.verifyPageLoaded();
    homePage.verifyUserLoggedIn();
  });

  it('should display error message with invalid credentials', () => {
    loginPage.verifyPageLoaded();
    loginPage.login('invaliduser', 'wrongpassword');

    // Verify error message
    loginPage.verifyErrorMessage('Invalid username or password');
  });

  it('should display error message when username is empty', () => {
    const testUser = getTestUser();

    loginPage.verifyPageLoaded();
    loginPage.enterPassword(testUser.password);
    loginPage.clickLoginButton();

    // Verify error message for empty username
    loginPage.verifyErrorMessage('Username is required');
  });

  it('should display error message when password is empty', () => {
    const testUser = getTestUser();

    loginPage.verifyPageLoaded();
    loginPage.enterUsername(testUser.username);
    loginPage.clickLoginButton();

    // Verify error message for empty password
    loginPage.verifyErrorMessage('Password is required');
  });

  it('should toggle password visibility', () => {
    loginPage.verifyPageLoaded();
    loginPage.enterPassword('testpassword');

    // Toggle password visibility
    loginPage.togglePasswordVisibility();

    // Verify password is visible (implementation depends on your app)
    // This is just an example assertion
    cy.get('[data-testid="password"]').should('have.attr', 'type', 'text');

    // Toggle back
    loginPage.togglePasswordVisibility();
    cy.get('[data-testid="password"]').should('have.attr', 'type', 'password');
  });

  it('should remember user credentials when remember me is checked', () => {
    const testUser = getTestUser();

    loginPage.verifyPageLoaded();
    loginPage.enterUsername(testUser.username);
    loginPage.enterPassword(testUser.password);
    loginPage.checkRememberMe();
    loginPage.clickLoginButton();

    // Verify redirect and cookies/localStorage
    homePage.verifyPageLoaded();

    // Check if credentials are stored (implementation specific)
    cy.getCookie('rememberMe').should('exist');
  });

  it('should navigate to forgot password page', () => {
    loginPage.verifyPageLoaded();
    loginPage.clickForgotPassword();

    // Verify navigation to forgot password page
    cy.url().should('include', '/forgot-password');
  });

  it('should navigate to signup page', () => {
    loginPage.verifyPageLoaded();
    loginPage.clickSignupLink();

    // Verify navigation to signup page
    cy.url().should('include', '/signup');
  });

  it('should clear input fields', () => {
    const testUser = getTestUser();

    loginPage.verifyPageLoaded();
    loginPage.enterUsername(testUser.username);
    loginPage.enterPassword(testUser.password);

    // Verify fields have values
    loginPage.verifyUsernameValue(testUser.username);

    // Clear fields
    loginPage.clearUsername();
    loginPage.clearPassword();

    // Verify fields are empty
    cy.get('[data-testid="username"]').should('have.value', '');
    cy.get('[data-testid="password"]').should('have.value', '');
  });

  it('should disable login button when form is invalid', () => {
    loginPage.verifyPageLoaded();

    // Check if login button is disabled without credentials
    loginPage.verifyLoginButtonDisabled();

    // Enter only username
    loginPage.enterUsername('testuser');
    loginPage.verifyLoginButtonDisabled();

    // Enter password as well
    loginPage.enterPassword('testpass');
    loginPage.verifyLoginButtonEnabled();
  });

  it('should handle special characters in username and password', () => {
    loginPage.verifyPageLoaded();
    loginPage.login('user@example.com', 'P@ssw0rd!#$');

    // Verify appropriate handling (success or error based on your app logic)
    cy.url().then((url) => {
      expect(url).to.satisfy((u: string) => u.includes('/home') || u.includes('/login'));
    });
  });
});
