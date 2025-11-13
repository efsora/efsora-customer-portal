import { generateUniqueEmail, trackCreatedUser, getCreatedUserIds, cleanupTestUsers, clearCreatedUserIds } from '../../api/authApi';
import { RegisterPage } from '../../pages/RegisterPage';
import { qase } from 'cypress-qase-reporter/mocha';

describe('UI > Register Functionality', () => {
  let registerPage: RegisterPage;
  let testUserEmail: string;
  let testUserPassword: string;

  before(() => {
    // Clear any previously tracked users
    clearCreatedUserIds();

    // Intercept register API to track created user IDs
    cy.intercept('POST', '**/api/v1/auth/register', (req) => {
      req.reply((res) => {
        if (res.body.success && res.body.data?.id) {
          trackCreatedUser(res.body.data.id);
        }
        return res;
      });
    });
  });

  beforeEach(() => {
    registerPage = new RegisterPage();
    testUserEmail = generateUniqueEmail('register-test');
    testUserPassword = 'RegisterPassword123!';
    registerPage.visit();
  });

  qase(9, it('should successfully register with valid credentials', () => {
    registerPage
      .verifyPageLoaded()
      .register('New Test User', testUserEmail, testUserPassword);

    // Verify redirect to home/login page or success message
    cy.url().should('include', '/', { timeout: 10000 });
  }));

  qase(10, it('should display validation error for empty fields', () => {
    registerPage
      .verifyPageLoaded()
      .clickCreateAccount()
      .verifyNameErrorVisible()
      .verifyEmailErrorVisible()
      .verifyPasswordErrorVisible();
  }));

  qase(11, it('should display error when email already exists', () => {
    // Try to register with an email that was already registered
    registerPage
      .verifyPageLoaded()
      .register('Another User', 'testuser.dev@example.com', 'SomePassword123!')
      .verifyErrorMessageVisible();

    registerPage.getErrorMessage().should('contain', 'Email already in use');
  }));

  qase(12, it('should navigate to login page', () => {
    registerPage
      .verifyPageLoaded()
      .clickSignIn();

    cy.url().should('include', '/login');
  }));

  // Cleanup test users after register tests complete
  after(() => {
    const userIds = getCreatedUserIds();
    return cleanupTestUsers(userIds);
  });
});
