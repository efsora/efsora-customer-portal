import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { getTestUser } from '../utils/envConfig';

describe('Home Page Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  beforeEach(() => {
    loginPage = new LoginPage();
    homePage = new HomePage();

    // Login before each test
    const testUser = getTestUser();
    loginPage.visit();
    loginPage.login(testUser.username, testUser.password);
    homePage.verifyPageLoaded();
  });

  it('should display home page correctly after login', () => {
    homePage.verifyMainContentVisible();
    homePage.verifyNavigationVisible();
    homePage.verifyUserLoggedIn();
  });

  it('should display welcome message with username', () => {
    const testUser = getTestUser();
    homePage.verifyWelcomeMessage(testUser.username);
  });

  it('should perform search functionality', () => {
    const searchTerm = 'test search';

    homePage.search(searchTerm);

    // Verify search was performed
    cy.url().should('include', 'search');
    // or verify search results are displayed
    cy.get('[data-testid="search-results"]').should('be.visible');
  });

  it('should display notifications', () => {
    homePage.clickNotificationBell();

    // Verify notifications panel is displayed
    cy.get('[data-testid="notifications-panel"]').should('be.visible');
  });

  it('should show correct notification count', () => {
    // Assuming user has some notifications
    homePage.verifyNotificationCount(3);
  });

  it('should navigate to user profile', () => {
    homePage.clickUserProfile();

    // Verify navigation to profile page
    cy.url().should('include', '/profile');
  });

  it('should navigate via sidebar menu', () => {
    homePage.navigateToSidebarItem('Settings');

    // Verify navigation
    cy.url().should('include', '/settings');
  });

  it('should navigate via navigation menu', () => {
    homePage.navigateToMenuItem('Dashboard');

    // Verify navigation
    cy.url().should('include', '/dashboard');
  });

  it('should successfully logout', () => {
    homePage.logout();

    // Verify redirect to login page
    cy.url().should('include', '/login');
    // Verify user is logged out (no auth token)
    cy.getCookie('authToken').should('not.exist');
  });

  it('should display user avatar', () => {
    cy.get('[data-testid="user-avatar"]').should('be.visible');
  });

  it('should open user menu when clicking avatar', () => {
    homePage.clickUserAvatar();

    // Verify user menu is displayed
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should maintain state after page refresh', () => {
    const testUser = getTestUser();

    // Verify initial state
    homePage.verifyWelcomeMessage(testUser.username);

    // Refresh page
    cy.reload();

    // Verify state is maintained
    homePage.verifyPageLoaded();
    homePage.verifyWelcomeMessage(testUser.username);
  });

  it('should handle empty search', () => {
    homePage.clickSearchButton();

    // Verify appropriate handling of empty search
    cy.get('[data-testid="search-error"]')
      .should('be.visible')
      .and('contain', 'Please enter a search term');
  });

  it('should display sidebar', () => {
    homePage.verifySidebarVisible();
  });
});
