import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { registerUserAndLogin, generateUniqueEmail } from '../../api/authApi';

describe('UI > Login Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let testUserEmail: string;
  let testUserPassword: string;

  // Create test user before all tests
  before(() => {
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

    /**
     * @qaseId 202
     */
    /**
     * @qaseId 202
     */
    /**
     * @qaseId 244
     */
  it('should successfully login with valid credentials', () => {
    loginPage
      .verifyPageLoaded()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .verifyUserLoggedIn();
  });

    /**
     * @qaseId 203
     */
    /**
     * @qaseId 203
     */
    /**
     * @qaseId 245
     */
  it('should display error message with invalid credentials', () => {
    loginPage
      .verifyPageLoaded()
      .login('invalid@example.com', 'wrongpassword')
      .verifyErrorMessageVisible();
  });

    /**
     * @qaseId 204
     */
    /**
     * @qaseId 204
     */
    /**
     * @qaseId 246
     */
  it('should display error message when email is empty', () => {
    loginPage
      .verifyPageLoaded()
      .enterPassword(testUserPassword)
      .clickSignIn()
      .verifyEmailErrorVisible()
      .verifyEmailErrorContains('Email is required');
  });

    /**
     * @qaseId 205
     */
    /**
     * @qaseId 205
     */
    /**
     * @qaseId 247
     */
  it('should display error message when password is empty', () => {
    loginPage
      .verifyPageLoaded()
      .enterEmail(testUserEmail)
      .clickSignIn()
      .verifyPasswordErrorVisible()
      .verifyPasswordErrorContains('Password is required');
  });

    /**
     * @qaseId 206
     */
    /**
     * @qaseId 206
     */
    /**
     * @qaseId 248
     */
  it('should navigate to signup page', () => {
    loginPage
      .verifyPageLoaded()
      .clickSignUp();

    cy.url().should('include', '/register');
  });

    /**
     * @qaseId 207
     */
    /**
     * @qaseId 207
     */
    /**
     * @qaseId 249
     */
  it('should clear input fields', () => {
    loginPage
      .verifyPageLoaded()
      .enterEmail(testUserEmail)
      .enterPassword(testUserPassword);

    // Verify fields have values
    loginPage.getEmailValue().should('equal', testUserEmail);

    loginPage
      .clearEmail()
      .clearPassword();

    // Verify fields are empty
    loginPage.getEmailValue().should('equal', '');
    loginPage.getPasswordValue().should('equal', '');
  });

    /**
     * @qaseId 208
     */
    /**
     * @qaseId 208
     */
    /**
     * @qaseId 250
     */
  it('should display loading text on submit button while signing in', () => {
    loginPage
      .verifyPageLoaded()
      .enterEmail(testUserEmail)
      .enterPassword(testUserPassword)
      .clickSignIn()
      .verifySignInButtonLoading();
  });

    /**
     * @qaseId 209
     */
    /**
     * @qaseId 209
     */
    /**
     * @qaseId 251
     */
  it('should display page title and form elements', () => {
    loginPage
      .verifyPageLoaded()
      .verifyPageTitle()
      .verifyEmailFieldVisible()
      .verifyPasswordFieldVisible()
      .verifySignUpLinkVisible();
  });
});
