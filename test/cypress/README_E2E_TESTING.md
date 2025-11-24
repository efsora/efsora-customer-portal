# E2E Testing Guide - Cypress + Page Object Model

Complete guide to writing E2E tests using Cypress and Page Object Model (POM) pattern with `data-testid` selectors.

## Quick Start

### Run Cypress Tests

```bash
cd test

# Open Cypress UI
npm run cypress:open

# Run all tests headless
npm run cypress:run

# Run specific test file
npm run test:e2e -- --spec "cypress/e2e/auth/login.cy.ts"

# Run in Docker
npm run docker:test
```

---

## Page Object Models (POMs)

Located in `cypress/pages/`

### Available POMs

- **LoginPage.ts** - Login form testing
- **RegisterPage.ts** - Registration form testing
- **ChatPage.ts** - Chat functionality testing

### POM Pattern Benefits

✅ Centralized selectors - Easy to maintain when UI changes
✅ Readable test code - Tests read like specifications
✅ Reusable methods - DRY principle
✅ data-testid selectors - Resilient to CSS changes

---

## Example E2E Tests

### Example 1: Basic Login Test

```typescript
import { LoginPage } from '../pages/LoginPage';

describe('Login', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    loginPage.visit();
  });

  it('should login with valid credentials', () => {
    loginPage
      .verifyPageLoaded()
      .login('user@example.com', 'password123')
      .verifyPageLoaded(); // Assumes redirect to dashboard

    cy.url().should('include', '/dashboard');
  });

  it('should display email error for invalid email', () => {
    loginPage
      .enterEmail('invalid-email')
      .enterPassword('password123')
      .clickSignIn()
      .verifyEmailErrorVisible()
      .verifyEmailErrorContains('Invalid email format');
  });

  it('should display password error for short password', () => {
    loginPage
      .enterEmail('user@example.com')
      .enterPassword('short')
      .clickSignIn()
      .verifyPasswordErrorVisible()
      .verifyPasswordErrorContains('at least 8 characters');
  });

  it('should display server error on failed login', () => {
    loginPage
      .login('user@example.com', 'wrongpassword')
      .verifyErrorMessageVisible()
      .verifyErrorMessageContains('Login failed');
  });

  it('should navigate to signup page', () => {
    loginPage
      .clickSignUp();

    cy.url().should('include', '/register');
  });
});
```

### Example 2: Registration Test

```typescript
import { RegisterPage } from '../pages/RegisterPage';

describe('Registration', () => {
  const registerPage = new RegisterPage();

  beforeEach(() => {
    registerPage.visit();
  });

  it('should register with valid credentials', () => {
    registerPage
      .verifyPageLoaded()
      .register('John Doe', 'john@example.com', 'password123');

    cy.url().should('include', '/dashboard'); // Redirect after successful registration
  });

  it('should validate all required fields', () => {
    registerPage
      .clickCreateAccount()
      .verifyNameErrorVisible()
      .verifyEmailErrorVisible()
      .verifyPasswordErrorVisible()
      .verifyConfirmPasswordErrorVisible();
  });

  it('should validate password match', () => {
    registerPage
      .enterName('John Doe')
      .enterEmail('john@example.com')
      .enterPassword('password123')
      .enterConfirmPassword('password456')
      .clickCreateAccount()
      .verifyConfirmPasswordErrorVisible()
      .verifyConfirmPasswordErrorContains('Passwords do not match');
  });

  it('should show server error on duplicate email', () => {
    registerPage
      .register('John Doe', 'existing@example.com', 'password123')
      .verifyErrorMessageVisible()
      .verifyErrorMessageContains('Email already registered');
  });

  it('should navigate to signin page', () => {
    registerPage
      .clickSignIn();

    cy.url().should('include', '/login');
  });
});
```

### Example 3: Chat Test

```typescript
import { ChatPage } from '../pages/ChatPage';
import { LoginPage } from '../pages/LoginPage';

describe('Chat', () => {
  const chatPage = new ChatPage();
  const loginPage = new LoginPage();

  beforeEach(() => {
    // Login before accessing chat
    loginPage.visit();
    loginPage.login('user@example.com', 'password123');

    // Navigate to chat
    cy.visit('/');
  });

  it('should display chat interface', () => {
    chatPage
      .verifyChatInputVisible()
      .verifyMessageListVisible();
  });

  it('should send message', () => {
    chatPage
      .sendMessage('Hello, how are you?')
      .verifyUserMessageDisplayed('Hello, how are you?');
  });

  it('should disable send button for empty message', () => {
    chatPage.verifySendButtonDisabled();
  });

  it('should enable send button when message is entered', () => {
    chatPage
      .typeMessage('test message')
      .verifySendButtonEnabled();
  });

  it('should receive bot response', () => {
    chatPage
      .sendMessageAndWaitForResponse('Hello!')
      .verifyUserMessageDisplayed('Hello!')
      .verifyLastMessageFromBot();
  });

  it('should display messages with timestamps', () => {
    chatPage
      .sendMessage('Test message')
      .verifyTimestampVisible();
  });

  it('should clear input after sending', () => {
    chatPage
      .sendMessage('Test message');

    chatPage.getInputValue().should('equal', '');
  });

  it('should scroll to latest message', () => {
    chatPage
      .sendMessage('Message 1')
      .sendMessage('Message 2')
      .sendMessage('Message 3')
      .scrollToBottom()
      .verifyLastMessageFromUser();
  });

  it('should handle loading state', () => {
    chatPage
      .sendMessage('Question that takes time')
      .verifyLoadingVisible();
  });
});
```

---

## Writing New E2E Tests

### Step 1: Create Test File

Create `cypress/e2e/{feature}/{test-name}.cy.ts`

```typescript
describe('Feature Name', () => {
  // Tests here
});
```

### Step 2: Import Page Objects

```typescript
import { LoginPage } from '../pages/LoginPage';
import { SomePage } from '../pages/SomePage';
```

### Step 3: Instantiate POMs

```typescript
describe('Feature', () => {
  const loginPage = new LoginPage();
  const somePage = new SomePage();

  beforeEach(() => {
    // Setup before each test
    loginPage.visit();
  });
});
```

### Step 4: Write Test Cases

```typescript
it('should do something', () => {
  somePage
    .action1()
    .action2()
    .verifyResult1()
    .verifyResult2();
});
```

### Step 5: Use Assertions

```typescript
// Cypress assertions
cy.url().should('include', '/dashboard');
cy.get('@element').should('be.visible');
cy.get('@element').should('contain', 'text');
cy.get('@element').should('have.value', 'value');

// POM assertions (using BasePage methods)
somePage.verifyPageLoaded();
somePage.verifyErrorMessageVisible();
somePage.verifyButtonDisabled();
```

---

## Best Practices

### ✅ DO

- Use Page Object Models for all UI interactions
- Use `data-testid` selectors (resilient to CSS changes)
- Keep tests focused on one feature
- Use descriptive test names
- Use `beforeEach` for common setup
- Chain POM methods for readability
- Test user workflows, not implementation details
- Wait for elements before interacting

### ❌ DON'T

- Use CSS class selectors (fragile)
- Use XPath selectors (hard to maintain)
- Mix POM and raw Cypress selectors
- Create tests that depend on other tests
- Use `cy.wait()` with hardcoded delays
- Test multiple features in one test
- Over-specify assertions

### Example: Good vs Bad

**❌ Bad**
```typescript
// Raw selectors, no POM, unclear intent
it('test login', () => {
  cy.get('.login-form input[type="email"]').type('test@example.com');
  cy.get('.login-form input[type="password"]').type('password');
  cy.get('.login-form button').click();
  cy.wait(2000);
  cy.url().should('include', 'dashboard');
});
```

**✅ Good**
```typescript
// POM, data-testid, clear intent
const loginPage = new LoginPage();

it('should login successfully', () => {
  loginPage
    .visit()
    .login('test@example.com', 'password')
    .verifyPageLoaded();

  cy.url().should('include', '/dashboard');
});
```

---

## Creating New Page Objects

### Template

```typescript
import { BasePage } from './BasePage';

export class NewPage extends BasePage {
  private readonly selectors = {
    container: '[data-testid="new-page-container"]',
    element1: '[data-testid="new-page-element-1"]',
    element2: '[data-testid="new-page-element-2"]',
    button: '[data-testid="new-page-button"]',
  };

  constructor() {
    super('/page-url');
  }

  // Action methods (return this for chaining)
  clickButton(): this {
    this.click(this.selectors.button);
    return this;
  }

  enterText(text: string): this {
    this.type(this.selectors.element1, text);
    return this;
  }

  // Verification methods (return this for chaining)
  verifyPageLoaded(): this {
    this.waitForElement(this.selectors.container);
    return this;
  }

  verifyButtonDisabled(): this {
    this.getElement(this.selectors.button).should('be.disabled');
    return this;
  }

  // Getter methods (return Cypress.Chainable)
  getTextValue(): Cypress.Chainable<string> {
    return this.getElement(this.selectors.element1).invoke('val') as Cypress.Chainable<string>;
  }
}
```

### Naming Conventions

**Action Methods** - Imperative form
- `clickButton()`
- `enterEmail()`
- `submitForm()`

**Verification Methods** - Start with `verify`
- `verifyPageLoaded()`
- `verifyErrorVisible()`
- `verifyButtonDisabled()`

**Getter Methods** - Start with `get`
- `getEmailValue()`
- `getErrorMessage()`
- `getMessageCount()`

---

## Using data-testid in Components

Add `data-testid` to all interactive elements:

```typescript
// ✅ Good
<input data-testid="login-form-email-input" />
<button data-testid="login-form-submit-button">Sign In</button>
<div data-testid="login-form-error-message">{error}</div>

// ❌ Avoid
<input className="email-field" />
<button className="btn btn-primary">Sign In</button>
<div className="error">{error}</div>
```

See [TEST_ID_REFERENCE.md](../TEST_ID_REFERENCE.md) for all component test IDs.

---

## Common Patterns

### Waiting for Elements

```typescript
// Wait for element to be visible
this.waitForElement('[data-testid="element"]');

// Wait with custom timeout
this.waitForElement('[data-testid="element"]', 20000); // 20 seconds

// Wait for specific condition
cy.get('[data-testid="element"]').should('contain', 'text');
```

### Handling Async Operations

```typescript
// Wait for new message (chat example)
chatPage
  .sendMessage('Hello')
  .waitForNewMessage(); // Waits for response to appear

// Wait for redirect
cy.url().should('include', '/dashboard'); // Automatically waits
```

### Testing Error States

```typescript
it('should show error on failed login', () => {
  loginPage
    .login('user@example.com', 'wrongpassword')
    .verifyErrorMessageVisible()
    .getErrorMessage()
    .should('include', 'Invalid credentials');
});
```

### Testing Form Validation

```typescript
it('should validate email format', () => {
  loginPage
    .enterEmail('invalid-email')
    .clickSignIn()
    .verifyEmailErrorVisible()
    .verifyEmailErrorContains('Invalid email');
});
```

---

## Debugging Tests

### Run Single Test

```bash
npm run test:spec -- "cypress/e2e/auth/login.cy.ts"
```

### Run in Debug Mode

```bash
npm run cypress:open  # Click "E2E Testing" then select browser
# Step through test with inspector
```

### View Test Video

After running tests, video is saved in `cypress/videos/`

### Check Test Screenshots

Screenshots saved in `cypress/screenshots/` on failure

### Use `cy.debug()`

```typescript
cy.get('[data-testid="element"]').debug();
```

### Use Browser DevTools

```typescript
cy.pause(); // Pauses test, use browser DevTools to inspect
```

---

## Test Structure

### Given-When-Then (Recommended)

```typescript
it('should login successfully', () => {
  // Given - setup
  loginPage.visit();
  loginPage.verifyPageLoaded();

  // When - action
  loginPage.login('user@example.com', 'password123');

  // Then - verification
  cy.url().should('include', '/dashboard');
});
```

### Arrange-Act-Assert

```typescript
it('should validate email', () => {
  // Arrange
  const invalidEmail = 'not-an-email';

  // Act
  loginPage.visit();
  loginPage.enterEmail(invalidEmail);
  loginPage.clickSignIn();

  // Assert
  loginPage.verifyEmailErrorVisible();
});
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
- name: Run Cypress Tests
  run: npm run docker:test

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v2
  with:
    name: cypress-results
    path: test/cypress/videos/
```

---

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Page Object Model Pattern](https://docs.cypress.io/guides/references/best-practices#Using-Page-Objects)
- [data-testid Best Practices](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-css-changes)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

---

**Last Updated**: November 2025
**Cypress Version**: Latest
**POM Count**: 3 (growing)
