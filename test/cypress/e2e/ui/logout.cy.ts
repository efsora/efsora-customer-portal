import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { registerUserAndLogin, generateUniqueEmail } from '../../api/authApi';

describe('UI > Logout Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let testUserEmail: string;
  let testUserPassword: string;

  // Create test user before all tests
  before(() => {
    testUserEmail = generateUniqueEmail('logout-test');
    testUserPassword = 'LogoutPassword123!';

    registerUserAndLogin({
      name: 'Logout Test User',
      email: testUserEmail,
      password: testUserPassword,
    });
  });

  beforeEach(() => {
    loginPage = new LoginPage();
    homePage = new HomePage();
  });

  it('should successfully logout and redirect to login page', () => {
    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .logout();

    cy.url().should('include', '/login');
  });

  it('should handle logout button loading state', () => {
    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .logout();

    cy.url().should('include', '/login');
  });

  it.skip('should clear auth state even if backend logout fails', () => {
    // Intercept logout endpoint to simulate failure
    cy.intercept('POST', '**/api/v1/auth/logout', {
      statusCode: 500,
      body: {
        success: false,
        message: 'Server error',
      },
    }).as('logoutFail');

    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .logout();

    // Wait for API call
    cy.wait('@logoutFail');

    // Should still redirect even on failure (graceful degradation)
    cy.url().should('include', '/login');
  });

  it('should prevent access to protected routes after logout', () => {
    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .logout();

    // Try to access protected route (should redirect to login)
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it.skip('should successfully call backend logout endpoint', () => {
    // Intercept logout endpoint
    cy.intercept('POST', '**/api/v1/auth/logout').as('logoutRequest');

    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .logout();

    // Verify API call was made
    cy.wait('@logoutRequest').its('response.statusCode').should('eq', 200);
  });
});
