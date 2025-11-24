import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { sendInvitationAndRegister, generateUniqueEmail } from '../../api/authApi';

describe('UI > Logout Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let testUserEmail: string;
  let testUserPassword: string;
  const testUserName = 'Logout TestUser';

  // Create test user before all tests
  before(() => {
    testUserEmail = generateUniqueEmail('logout-test');
    testUserPassword = 'LogoutPassword123!';

    sendInvitationAndRegister({
      name: 'Logout',
      surname: 'TestUser',
      email: testUserEmail,
      password: testUserPassword,
    });
  });

  beforeEach(() => {
    loginPage = new LoginPage();
    homePage = new HomePage();
  });

  it('should open dropdown and successfully logout', () => {
    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .verifyDropdownClosed()
      .openUserDropdown()
      .verifyDropdownOpen()
      .verifyLogoutButtonVisible()
      .clickLogoutButton();

    cy.url().should('include', '/login');
  });

  it('should display dropdown menu items correctly', () => {
    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .openUserDropdown()
      .verifyHelpSupportButtonVisible()
      .verifyLogoutButtonVisible();
  });

  it('should handle dropdown trigger click to open and close', () => {
    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .verifyDropdownClosed()
      .openUserDropdown()
      .verifyDropdownOpen()
      .closeUserDropdown()
      .verifyDropdownClosed();
  });

  it('should close dropdown when clicking outside', () => {
    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .openUserDropdown()
      .verifyDropdownOpen()
      .clickOutsideDropdown()
      .verifyDropdownClosed();
  });

  it('should successfully complete logout flow with API call', () => {
    // Intercept logout endpoint to verify it's called
    cy.intercept('POST', '**/api/v1/auth/logout').as('logoutRequest');

    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .openUserDropdown()
      .verifyLogoutButtonVisible()
      .clickLogoutButton();

    // Verify the logout API was called and succeeded
    cy.wait('@logoutRequest').its('response.statusCode').should('be.oneOf', [200, 201]);

    // Verify navigation to login page after successful logout
    cy.url().should('include', '/login');
  });

  it('should clear auth state even if backend logout fails', () => {
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

  it('should successfully call backend logout endpoint', () => {
    // Intercept logout endpoint
    cy.intercept('POST', '**/api/v1/auth/logout').as('logoutRequest');

    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .logout();

    // Verify API call was made
    cy.wait('@logoutRequest').its('response.statusCode').should('be.oneOf', [200, 201]);
  });

  it('should close dropdown after successful logout', () => {
    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .openUserDropdown()
      .verifyDropdownOpen()
      .clickLogoutButton();

    // Should redirect to login (dropdown is no longer relevant)
    cy.url().should('include', '/login');
  });

  it('should display user info in dropdown on mobile', () => {
    // Set mobile viewport
    cy.viewport(375, 667);

    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .openUserDropdown()
      .verifyUserInfoInMenu(testUserName, testUserEmail);
  });

  it('should display user info inline on desktop', () => {
    // Set desktop viewport
    cy.viewport(1440, 900);

    loginPage
      .visit()
      .login(testUserEmail, testUserPassword);

    homePage
      .verifyPageLoaded()
      .verifyUserInfoInTrigger(testUserName, testUserEmail);
  });
});
