# Generate Page Object Model (POM) Class

This skill guides you through creating Page Object Model classes that follow the project's established patterns.

## What is a Page Object Model?

A Page Object is a class that:
- **Encapsulates** page selectors and interactions into reusable methods
- **Abstracts** Cypress commands behind meaningful method names
- **Enables** method chaining for fluent, readable test code
- **Centralizes** maintenance - changing a selector affects all tests using it
- **Improves** test readability by using domain language, not CSS selectors

## File Location

All POM classes go in: `test/cypress/pages/FeaturePage.ts`

## POM Structure Template

```typescript
import BasePage from './BasePage';

/**
 * FeaturePage - Page Object for the Feature feature page
 * Encapsulates selectors and interactions for the feature page
 *
 * Inherits from BasePage to get common methods like:
 * - visit(), click(), type(), waitForElement(), etc.
 * - All BasePage methods support method chaining
 */
export class FeaturePage extends BasePage {
  /**
   * Selectors - Define all page element selectors here
   * Use data-testid when available (preferred for stability)
   * Centralize selectors for easy maintenance
   */
  private readonly selectors = {
    // Form elements
    nameInput: '[data-testid="feature-name-input"]',
    emailInput: '[data-testid="feature-email-input"]',
    submitButton: '[data-testid="feature-submit-button"]',

    // Display elements
    successMessage: '[data-testid="success-message"]',
    errorMessage: '[data-testid="error-message"]',
    pageTitle: 'h1',

    // Dropdown/Modal
    featureDropdown: '[data-testid="feature-dropdown"]',
    dropdownOption: (optionText: string) => `[data-testid="feature-dropdown-${optionText}"]`,
  };

  /**
   * Constructor - Call parent constructor
   */
  constructor() {
    super();
    // Optional: Set base URL path if different from /
    // this.basePath = '/feature-page';
  }

  /**
   * Override visit() to set specific path if needed
   * Otherwise it uses the basePath + '/' by default
   */
  visit(): this {
    cy.visit('/feature-page');
    return this;
  }

  /**
   * Verification Methods - Verify page state
   * All return `this` for method chaining
   */

  verifyPageLoaded(): this {
    cy.get(this.selectors.pageTitle).should('be.visible');
    cy.log('✓ Feature page loaded');
    return this;
  }

  verifySuccessMessageVisible(): this {
    cy.get(this.selectors.successMessage).should('be.visible');
    return this;
  }

  verifyErrorMessageVisible(): this {
    cy.get(this.selectors.errorMessage).should('be.visible');
    return this;
  }

  verifySubmitButtonEnabled(): this {
    cy.get(this.selectors.submitButton).should('not.be.disabled');
    return this;
  }

  verifySubmitButtonDisabled(): this {
    cy.get(this.selectors.submitButton).should('be.disabled');
    return this;
  }

  /**
   * Input/Interaction Methods - Perform user actions
   * All return `this` for method chaining
   */

  enterName(name: string): this {
    cy.get(this.selectors.nameInput).clear().type(name);
    return this;
  }

  enterEmail(email: string): this {
    cy.get(this.selectors.emailInput).clear().type(email);
    return this;
  }

  submitForm(): this {
    cy.get(this.selectors.submitButton).click();
    return this;
  }

  selectDropdownOption(optionText: string): this {
    cy.get(this.selectors.featureDropdown).click();
    cy.get(this.selectors.dropdownOption(optionText)).click();
    return this;
  }

  /**
   * Getter Methods - Get values from page (don't return `this`)
   * These return data, not the page object, so don't chain
   */

  getSuccessMessage(): Cypress.Chainable<string> {
    return cy.get(this.selectors.successMessage).invoke('text');
  }

  getErrorMessage(): Cypress.Chainable<string> {
    return cy.get(this.selectors.errorMessage).invoke('text');
  }

  getNameInputValue(): Cypress.Chainable<string> {
    return cy.get(this.selectors.nameInput).invoke('val') as Cypress.Chainable<string>;
  }

  /**
   * Assertion Helper Methods - Return assertions for common checks
   * Use these for repeated assertions across multiple tests
   */

  verifyNameErrorMessage(expectedText: string): this {
    cy.get('[data-testid="name-error"]').should('contain', expectedText);
    return this;
  }

  verifyEmailErrorMessage(expectedText: string): this {
    cy.get('[data-testid="email-error"]').should('contain', expectedText);
    return this;
  }

  /**
   * Complex Interaction Chains - Group related actions
   * These encapsulate multi-step workflows
   */

  submitFeatureForm(name: string, email: string): this {
    return this
      .enterName(name)
      .enterEmail(email)
      .submitForm();
  }

  fillAndSubmitForm(data: { name: string; email: string }): this {
    return this.submitFeatureForm(data.name, data.email);
  }
}
```

## Key Patterns to Follow

### 1. **Selectors at Top**
```typescript
private readonly selectors = {
  nameInput: '[data-testid="name-input"]',
  submitButton: '[data-testid="submit-button"]',
  errorMessage: '[data-testid="error-message"]',
};
```

**Why?**
- Easy to find and update selectors
- Single source of truth
- If frontend changes selector, fix in one place
- Make selectors `readonly` and `private`

### 2. **Method Naming Convention**
```typescript
// Verification methods start with "verify"
verifyPageLoaded(): this
verifyErrorMessageVisible(): this
verifySubmitButtonDisabled(): this

// Action methods use clear verb names
enterName(name: string): this
submitForm(): this
selectOption(option: string): this

// Getter methods start with "get"
getErrorMessage(): Cypress.Chainable<string>
getInputValue(): Cypress.Chainable<string>
```

### 3. **Return Type Matters**

```typescript
// ✓ Methods that do actions MUST return `this`
enterName(name: string): this {
  cy.get(this.selectors.nameInput).type(name);
  return this;  // Enable chaining!
}

// ✓ Getter/value-returning methods return the value, NOT `this`
getErrorMessage(): Cypress.Chainable<string> {
  return cy.get(this.selectors.errorMessage).invoke('text');
  // Don't return this - test needs the actual value
}
```

### 4. **Don't Overuse Chaining**

```typescript
// ✗ Too much chaining - hard to understand what's happening
featurePage.verifyPageLoaded().fillAndSubmit('name', 'email').verifySuccess();

// ✓ Better - more readable for complex workflows
featurePage.verifyPageLoaded();
featurePage.fillAndSubmit('name', 'email');
featurePage.verifySuccess();

// ✓ Also good - chain related steps
featurePage
  .verifyPageLoaded()
  .enterName('name')
  .enterEmail('email')
  .submitForm();
```

### 5. **Use BasePage Methods**

All your methods should leverage BasePage:

```typescript
import BasePage from './BasePage';

export class MyPage extends BasePage {
  verifyTitle(title: string): this {
    // BasePage has clickByTestId, typeByTestId, etc.
    this.verifyTitle(title);
    return this;
  }
}
```

**BasePage provides:**
- `visit(path?)`: Navigate to page
- `clickByTestId(testId)`: Click element by data-testid
- `typeByTestId(testId, value)`: Type in element
- `waitForElement(selector)`: Wait for element visible
- `waitForElementToDisappear(selector)`: Wait for element hidden
- `scrollToElement(selector)`: Scroll to element
- `selectDropdown(selector)`: Select dropdown option
- All return `this` for chaining

### 6. **Parameterized Selectors**

```typescript
// ✓ GOOD - Flexible selectors for dynamic elements
private readonly selectors = {
  // Function selector for dynamic content
  dropdownOption: (text: string) => `[data-testid="dropdown-${text}"]`,
  rowByName: (name: string) => `tr:contains('${name}')`,
};

selectOption(optionText: string): this {
  cy.get(this.selectors.dropdownOption(optionText)).click();
  return this;
}

// ✗ BAD - Hardcoded selector for every value
selectOption1(): this { cy.get('[data-testid="dropdown-option-1"]').click(); return this; }
selectOption2(): this { cy.get('[data-testid="dropdown-option-2"]').click(); return this; }
selectOption3(): this { cy.get('[data-testid="dropdown-option-3"]').click(); return this; }
```

## Complete Example: User Dropdown Page

```typescript
import BasePage from './BasePage';

export class UserDropdownPage extends BasePage {
  private readonly selectors = {
    userDropdownTrigger: 'img[alt="toggle dropdown"]',
    logoutButton: '[data-testid="logout-button"]',
    profileLink: '[data-testid="profile-link"]',
    settingsLink: '[data-testid="settings-link"]',
    dropdownMenu: '[data-testid="user-dropdown-menu"]',
  };

  openUserDropdown(): this {
    cy.get(this.selectors.userDropdownTrigger).click();
    cy.get(this.selectors.dropdownMenu).should('be.visible');
    return this;
  }

  logout(): this {
    this.openUserDropdown();
    cy.get(this.selectors.logoutButton).should('be.visible').click();
    return this;
  }

  goToProfile(): this {
    this.openUserDropdown();
    cy.get(this.selectors.profileLink).click();
    return this;
  }

  verifyLogoutButtonNotExist(): this {
    cy.get('body').then(($body) => {
      // Logout button should not exist in DOM when not authenticated
      expect($body.find(this.selectors.logoutButton)).to.have.length(0);
    });
    return this;
  }
}
```

## Checklist Before Creating PR

- [ ] File named: `FeaturePage.ts` (PascalCase)
- [ ] Class extends `BasePage`
- [ ] All selectors use `data-testid` attributes when possible
- [ ] Selectors stored in private `selectors` object
- [ ] Action methods return `this` for chaining
- [ ] Getter methods return the actual value (not `this`)
- [ ] Method names follow convention (verify*, enter*, click*, get*, etc.)
- [ ] Methods are documented with JSDoc comments
- [ ] No Cypress commands directly in tests - all go through POM
- [ ] Related actions grouped into compound methods

## File Organization

```
test/cypress/pages/
├── BasePage.ts           ← Base class with common methods
├── FeaturePage.ts        ← Your new page object
├── LoginPage.ts
├── RegisterPage.ts
├── HomePage.ts
└── ChatPage.ts
```

## Tips for Better Page Objects

1. **Think like a user** - Method names should describe what a user does
2. **Hide complexity** - Multi-step interactions become single methods
3. **Keep it DRY** - Reuse BasePage methods instead of reinventing
4. **Use descriptive names** - `fillLoginForm()` is better than `fillForm()`
5. **Document assumptions** - Add JSDoc comments explaining selectors
