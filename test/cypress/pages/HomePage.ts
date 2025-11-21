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
    helpSupportButton: '[data-testid="help-support-button"]',
    userDropdownTrigger: '[data-testid="user-dropdown-trigger"]',
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
    super('/');
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
   * Open user profile dropdown
   */
  openUserDropdown(): this {
    this.click(this.selectors.userDropdownTrigger);
    return this;
  }

  /**
   * Close user profile dropdown by clicking trigger again
   */
  closeUserDropdown(): this {
    this.click(this.selectors.userDropdownTrigger);
    return this;
  }

  /**
   * Click logout button (opens dropdown first if needed)
   */
  logout(): this {
    this.openUserDropdown();
    // Wait for logout button to be visible after dropdown opens
    this.waitForElement(this.selectors.logoutButton);
    this.click(this.selectors.logoutButton);
    return this;
  }

  /**
   * Click logout button (assumes dropdown is already open)
   */
  clickLogoutButton(): this {
    this.click(this.selectors.logoutButton);
    return this;
  }

  /**
   * Verify logout button is not visible (dropdown is closed)
   */
  verifyLogoutButtonNotExist(): this {
    // Check that logout button element doesn't exist in the DOM
    this.getElement(this.selectors.logoutButton).should('not.exist');
    return this;
  }

  /**
   * Verify logout button is visible (dropdown is open)
   */
  verifyLogoutButtonVisible(): this {
    this.getElement(this.selectors.logoutButton).should('be.visible');
    return this;
  }

  /**
   * Verify dropdown is open
   */
  verifyDropdownOpen(): this {
    this.waitForElement(this.selectors.logoutButton);
    this.getElement(this.selectors.logoutButton).should('be.visible');
    return this;
  }

  /**
   * Verify dropdown is closed
   */
  verifyDropdownClosed(): this {
    this.getElement(this.selectors.logoutButton).should('not.exist');
    return this;
  }

  /**
   * Verify menu item is visible in dropdown
   * @param menuItemText - Text of the menu item
   */
  verifyMenuItemVisible(menuItemText: string): this {
    cy.contains(menuItemText).should('be.visible');
    return this;
  }

  /**
   * Verify logout button contains specific text
   * @param text - Expected text (e.g., "Logout" or "Logging out...")
   */
  verifyLogoutButtonText(text: string): this {
    this.getElement(this.selectors.logoutButton).should('contain', text);
    return this;
  }

  /**
   * Click outside the dropdown to close it
   */
  clickOutsideDropdown(): this {
    cy.get('body').click(0, 0);
    return this;
  }

  /**
   * Verify user info is visible in dropdown trigger (desktop)
   * @param userName - Expected user name
   * @param email - Expected email
   */
  verifyUserInfoInTrigger(userName: string, email: string): this {
    this.getElement(this.selectors.userDropdownTrigger).should('contain', userName);
    this.getElement(this.selectors.userDropdownTrigger).should('contain', email);
    return this;
  }

  /**
   * Verify user info is visible in dropdown menu (mobile)
   * @param userName - Expected user name
   * @param email - Expected email
   */
  verifyUserInfoInMenu(userName: string, email: string): this {
    cy.contains(userName).should('be.visible');
    cy.contains(email).should('be.visible');
    return this;
  }

  /**
   * Click help & support button in dropdown
   */
  clickHelpSupport(): this {
    this.click(this.selectors.helpSupportButton);
    return this;
  }

  /**
   * Verify help & support button is visible
   */
  verifyHelpSupportButtonVisible(): this {
    this.getElement(this.selectors.helpSupportButton).should('be.visible');
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
   * Verify user is logged in (by checking for welcome message)
   */
  verifyUserLoggedIn(): this {
    this.waitForElement(this.selectors.welcomeMessage);
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
