# Test Naming Conventions

## Quick Reference

| Item | Pattern | Example |
|------|---------|---------|
| Test file | kebab-case.cy.ts | `login.cy.ts` |
| Page object | PascalCase.ts | `LoginPage.ts` |
| Describe block | Feature Functionality | `Login Functionality` |
| Test case | should... | `should successfully login with valid credentials` |
| data-testid | kebab-case | `email-input`, `submit-button` |
| Selector variable | camelCase | `emailInput`, `submitButton` |
| Test user prefix | kebab-case | `login-test`, `register-test` |
| Verify method | verify\* | `verifyPageLoaded()` |
| Action method | enter\*/click\*/submit\* | `enterEmail()`, `submitForm()` |
| Getter method | get\* | `getErrorMessage()` |

## File Organization

```
test/cypress/
├── e2e/ui/feature-name.cy.ts
├── e2e/api/api-endpoint.cy.ts
├── pages/FeaturePage.ts
├── api/featureApi.ts
└── support/commands.ts
```

## Naming Rules

**Test Files:**
- Use `kebab-case`, end with `.cy.ts`
- Organize in `ui/` or `api/` folders

**Page Objects:**
- Use `PascalCase` with `Page` suffix
- End with `.ts`

**Selectors:**
- Use `data-testid="kebab-case"` in HTML
- Store in `private readonly selectors = { camelCase: '[data-testid="kebab-case"]' }`

**Methods (POM):**
- `verify*()` - Check page state, return `this`
- `enter*(value)` - User input, return `this`
- `click*()` - Click action, return `this`
- `get*()` - Retrieve value, return value (not `this`)

**Test Data:**
- Prefix: `testUserEmail`, `testUserPassword`
- Generate unique emails: `generateUniqueEmail('login-test')`
- One prefix per test suite

**Test Cases:**
- Start with "should": `should successfully login with valid credentials`
- Use `.skip()` for unimplemented features
- Group: happy path → errors → navigation → skipped

**Describe Blocks:**
- Format: `Feature Functionality`
- Examples: `Login Functionality`, `Chat Message Creation`
