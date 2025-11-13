# Generate E2E Test Following POM Pattern

This skill guides you through creating new E2E tests that follow the project's established patterns.

## Prerequisites

Before creating a test, ensure:
- The feature/page you're testing exists in the frontend
- A corresponding Page Object exists in `test/cypress/pages/`
- All required selectors have `data-testid` attributes in components
- Test user creation via API is available at `POST /api/v1/auth/register`

## Test Structure Template

All E2E tests should follow this structure:

```typescript
import { FeaturePage } from '../../pages/FeaturePage';
import { HomePage } from '../../pages/HomePage';
import {
  generateUniqueEmail,
  clearCreatedUserIds,
  getCreatedUserIds,
  cleanupTestUsers,
  trackCreatedUser,
} from '../../api/authApi';

describe('Feature Functionality', () => {
  let featurePage: FeaturePage;
  let homePage: HomePage;
  let testUserEmail: string;
  let testUserPassword: string;

  before(() => {
    // Clear tracking from previous test suites
    clearCreatedUserIds();

    // Create test data that ALL tests will use
    testUserEmail = generateUniqueEmail('feature-test');
    testUserPassword = 'FeatureTestPassword123!';

    // Setup: Register user via API
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/v1/auth/register`,
      body: {
        name: 'Feature Test User',
        email: testUserEmail,
        password: testUserPassword,
      },
    }).then((response) => {
      expect(response.status).to.equal(200);
      if (response.body.data?.id) {
        trackCreatedUser(response.body.data.id);
      }
    });
  });

  beforeEach(() => {
    featurePage = new FeaturePage();
    homePage = new HomePage();
    featurePage.visit();
  });

  it('should test primary feature behavior', () => {
    featurePage
      .verifyPageLoaded()
      .interactWithElement()
      .verifyExpectedState();
  });

  it('should test secondary feature behavior', () => {
    featurePage
      .verifyPageLoaded()
      .performAction()
      .verifyActionResult();
  });

  // Use .skip() for unimplemented backend features
  it.skip('should handle backend feature not yet implemented', () => {
    // This test will be enabled when backend implements the feature
  });

  after(() => {
    const userIds = getCreatedUserIds();
    return cleanupTestUsers(userIds);
  });
});
```

## Key Patterns to Follow

### 1. **Test Independence**
- Each test suite creates its own test user in `before()` hook
- No dependencies between test files
- Tests can run in any order
- Use unique email prefix (e.g., `feature-test`, `module-test`)

### 2. **Method Chaining (Fluent Interface)**
```typescript
// ✓ GOOD - Method chaining with fluent interface
featurePage
  .verifyPageLoaded()
  .enterInput('value')
  .clickButton()
  .verifyResult();

// ✗ BAD - No chaining
featurePage.verifyPageLoaded();
featurePage.enterInput('value');
featurePage.clickButton();
featurePage.verifyResult();
```

### 3. **Setup/Teardown**
- `before()`: Create shared test user(s) once for entire suite
- `beforeEach()`: Initialize page objects fresh for each test
- `after()`: Cleanup created users by ID

### 4. **Page Object Methods Return `this`**
All POM methods must return `this` to enable chaining:
```typescript
enterEmail(email: string) {
  cy.get('[data-testid="email"]').type(email);
  return this; // Enable chaining
}
```

### 5. **Test Naming**
- Use descriptive, action-based names: `should describe what is being tested`
- Start with "should" for clarity
- Be specific about the behavior being tested

### 6. **Assertion Patterns**
- Verify page loaded first with `verifyPageLoaded()`
- Assert the result of each action
- Use POM methods for assertions when possible

## File Organization

```
test/cypress/
├── e2e/
│   ├── ui/
│   │   ├── feature-name.cy.ts    ← Your test file
│   │   ├── login.cy.ts
│   │   ├── register.cy.ts
│   │   └── logout.cy.ts
│   └── api/
│       └── api-endpoint.cy.ts
├── pages/
│   ├── BasePage.ts
│   ├── FeaturePage.ts            ← Corresponding page object
│   ├── LoginPage.ts
│   └── HomePage.ts
├── api/
│   └── authApi.ts
└── support/
    ├── commands.ts
    └── e2e.ts
```

## Common Test Scenarios

### Testing Forms
```typescript
it('should submit form with valid data', () => {
  featurePage
    .verifyPageLoaded()
    .fillForm({
      name: 'Test User',
      email: 'test@example.com',
    })
    .submitForm()
    .verifySuccessMessage();
});

it('should show validation errors for empty fields', () => {
  featurePage
    .verifyPageLoaded()
    .submitForm()
    .verifyFieldErrors(['name', 'email']);
});
```

### Testing Navigation
```typescript
it('should navigate to next page', () => {
  featurePage
    .verifyPageLoaded()
    .clickNextButton();

  cy.url().should('include', '/next-page');
});
```

### Testing Authenticated Features
```typescript
it('should display feature when authenticated', () => {
  // Setup creates authenticated user in before() hook
  featurePage
    .visit()
    .verifyPageLoaded()
    .verifyFeatureVisible();
});
```

## Checklist Before Committing

- [ ] Test file follows naming convention: `feature-name.cy.ts`
- [ ] All page elements referenced have `data-testid` attributes
- [ ] Test methods use method chaining (fluent interface)
- [ ] `before()` hook creates test user and tracks ID
- [ ] `after()` hook cleans up users by ID
- [ ] No test depends on another test's state
- [ ] Unimplemented backend features use `.skip()`
- [ ] All assertions verify expected behavior
- [ ] Test can run independently without other tests
- [ ] TypeScript types are correct
- [ ] Tests pass locally with `npm run test:e2e`

## Running Your Test

```bash
cd test

# Run single test file
npm run test:spec -- "cypress/e2e/ui/feature-name.cy.ts"

# Run all UI tests
npm run test:e2e -- cypress/e2e/ui

# Open Cypress UI
npm run cypress:open
```
