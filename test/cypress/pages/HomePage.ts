import { BasePage } from './BasePage';

/**
 * HomePage - Page Object for Home/Dashboard functionality
 * Extends BasePage to inherit common functionality
 */
export class HomePage extends BasePage {
  // Selectors
  private readonly selectors = {
    welcomeMessage: '[data-testid="welcome-message"]',
    userProfile: '[data-testid="user-profile"]',
    logoutButton: '[data-testid="logout-button"]',
    navigationMenu: '[data-testid="navigation-menu"]',
    searchInput: '[data-testid="search-input"]',
    searchButton: '[data-testid="search-button"]',
    notificationBell: '[data-testid="notification-bell"]',
    notificationCount: '[data-testid="notification-count"]',
    mainContent: '[data-testid="main-content"]',
    sidebarMenu: '[data-testid="sidebar-menu"]',
    userAvatar: '[data-testid="user-avatar"]',
  };

  constructor() {
    super('/home');
  }

  /**
   * Verify home page is loaded
   */
  verifyPageLoaded(): this {
    this.waitForElement(this.selectors.welcomeMessage);
    this.waitForPageLoad();
    return this;
  }

  /**
   * Verify welcome message is displayed
   * @param username - Expected username in welcome message
   */
  verifyWelcomeMessage(username?: string): this {
    if (username) {
      this.shouldContainText(this.selectors.welcomeMessage, username);
    } else {
      this.waitForElement(this.selectors.welcomeMessage);
    }
    return this;
  }

  /**
   * Click logout button
   */
  logout(): this {
    this.click(this.selectors.logoutButton);
    return this;
  }

  /**
   * Click user profile
   */
  clickUserProfile(): this {
    this.click(this.selectors.userProfile);
    return this;
  }

  /**
   * Click user avatar
   */
  clickUserAvatar(): this {
    this.click(this.selectors.userAvatar);
    return this;
  }

  /**
   * Perform search
   * @param searchTerm - Term to search for
   */
  search(searchTerm: string): this {
    this.type(this.selectors.searchInput, searchTerm);
    this.click(this.selectors.searchButton);
    return this;
  }

  /**
   * Enter search term without submitting
   * @param searchTerm - Term to enter
   */
  enterSearchTerm(searchTerm: string): this {
    this.type(this.selectors.searchInput, searchTerm);
    return this;
  }

  /**
   * Click search button
   */
  clickSearchButton(): this {
    this.click(this.selectors.searchButton);
    return this;
  }

  /**
   * Click notification bell
   */
  clickNotificationBell(): this {
    this.click(this.selectors.notificationBell);
    return this;
  }

  /**
   * Get notification count
   */
  getNotificationCount(): Cypress.Chainable<string> {
    return this.getElement(this.selectors.notificationCount).invoke('text');
  }

  /**
   * Verify notification count
   * @param expectedCount - Expected count
   */
  verifyNotificationCount(expectedCount: number): this {
    this.shouldContainText(this.selectors.notificationCount, expectedCount.toString());
    return this;
  }

  /**
   * Navigate to menu item
   * @param menuItem - Menu item text
   */
  navigateToMenuItem(menuItem: string): this {
    this.getElement(this.selectors.navigationMenu).contains(menuItem).click();
    return this;
  }

  /**
   * Navigate to sidebar menu item
   * @param menuItem - Sidebar menu item text
   */
  navigateToSidebarItem(menuItem: string): this {
    this.getElement(this.selectors.sidebarMenu).contains(menuItem).click();
    return this;
  }

  /**
   * Verify main content is visible
   */
  verifyMainContentVisible(): this {
    this.waitForElement(this.selectors.mainContent);
    return this;
  }

  /**
   * Verify navigation menu is visible
   */
  verifyNavigationVisible(): this {
    this.waitForElement(this.selectors.navigationMenu);
    return this;
  }

  /**
   * Verify sidebar is visible
   */
  verifySidebarVisible(): this {
    this.waitForElement(this.selectors.sidebarMenu);
    return this;
  }

  /**
   * Verify user is logged in (by checking for user profile element)
   */
  verifyUserLoggedIn(): this {
    this.waitForElement(this.selectors.userProfile);
    return this;
  }

  /**
   * Get welcome message text
   */
  getWelcomeMessageText(): Cypress.Chainable<string> {
    return this.getElement(this.selectors.welcomeMessage).invoke('text');
  }

  /**
   * Wait for content to load
   */
  waitForContentLoad(): this {
    this.waitForElement(this.selectors.mainContent);
    return this;
  }
}
