import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import {
  registerUserAndLogin,
  generateUniqueEmail,
  clearCreatedUserIds,
  getCreatedUserIds,
  cleanupTestUsers,
} from '../../api/authApi';
import { qase } from 'cypress-qase-reporter/mocha';

describe('UI > Login Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let testUserEmail: string;
  let testUserPassword: string;

  // Create test users before all tests
  before(() => {
    // Clear any previously tracked users
    clearCreatedUserIds();

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

  qase(1, it('should successfully login with valid credentials', () => {
    loginPage
      .verifyPageLoaded()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .verifyUserLoggedIn();
  }));

  qase(2, it('should display error message with invalid credentials', () => {
    loginPage
      .verifyPageLoaded()
      .login('invalid@example.com', 'wrongpassword')
      .verifyErrorMessageVisible();
  }));

  qase(3, it('should display error message when email is empty', () => {
    loginPage
      .verifyPageLoaded()
      .enterPassword(testUserPassword)
      .clickSignIn()
      .verifyEmailErrorVisible()
      .verifyEmailErrorContains('Email is required');
  }));

  qase(4, it('should display error message when password is empty', () => {
    loginPage
      .verifyPageLoaded()
      .enterEmail(testUserEmail)
      .clickSignIn()
      .verifyPasswordErrorVisible()
      .verifyPasswordErrorContains('Password is required');
  }));

  qase(5, it('should navigate to signup page', () => {
    loginPage
      .verifyPageLoaded()
      .clickSignUp();

    cy.url().should('include', '/register');
  }));

  qase(6, it('should clear input fields', () => {
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
  }));

  qase(7, it('should display loading text on submit button while signing in', () => {
    loginPage
      .verifyPageLoaded()
      .enterEmail(testUserEmail)
      .enterPassword(testUserPassword)
      .clickSignIn()
      .verifySignInButtonLoading();
  }));

  qase(8, it('should display page title and form elements', () => {
    loginPage
      .verifyPageLoaded()
      .verifyPageTitle()
      .verifyEmailFieldVisible()
      .verifyPasswordFieldVisible()
      .verifySignUpLinkVisible();
  }));

  // Cleanup test users after login tests complete
  after(() => {
    const userIds = getCreatedUserIds();
    return cleanupTestUsers(userIds);
  });
});
