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

  it('should successfully login with valid credentials', () => {
    loginPage
      .verifyPageLoaded()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .verifyUserLoggedIn();
  });

  it('should display error message with invalid credentials', () => {
    loginPage
      .verifyPageLoaded()
      .login('invalid@example.com', 'wrongpassword')
      .verifyErrorMessageVisible();
  });

  it('should display error message when email is empty', () => {
    loginPage
      .verifyPageLoaded()
      .enterPassword(testUserPassword)
      .clickSignIn()
      .verifyEmailErrorVisible()
      .verifyEmailErrorContains('Email is required');
  });

  it('should display error message when password is empty', () => {
    loginPage
      .verifyPageLoaded()
      .enterEmail(testUserEmail)
      .clickSignIn()
      .verifyPasswordErrorVisible()
      .verifyPasswordErrorContains('Password is required');
  });

  it('should navigate to signup page', () => {
    loginPage
      .verifyPageLoaded()
      .clickSignUp();

    cy.url().should('include', '/register');
  });

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

  it('should display loading text on submit button while signing in', () => {
    loginPage
      .verifyPageLoaded()
      .enterEmail(testUserEmail)
      .enterPassword(testUserPassword)
      .clickSignIn()
      .verifySignInButtonLoading();
  });

  it('should display page title and form elements', () => {
    loginPage
      .verifyPageLoaded()
      .verifyPageTitle()
      .verifyEmailFieldVisible()
      .verifyPasswordFieldVisible()
      .verifySignUpLinkVisible();
  });
});
