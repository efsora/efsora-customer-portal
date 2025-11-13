# Qase Test Case Auto-Registration Fix

## Problem Summary

Test cases were not being auto-registered to Qase.io even though test runs were being recognized. The reporter was uploading test results but not creating corresponding test cases.

## Root Cause

The project was using **JSDoc `@qaseId` comments** to tag test cases:

```typescript
/**
 * @qaseId 18
 */
it('should successfully register a new user', () => {
  // test code
});
```

However, `cypress-qase-reporter` v3.1.0 **does not reliably parse JSDoc comments** for test case ID extraction. The reporter's primary method for identifying test cases is the **`qase()` function wrapper**.

## Solution Implemented

All test files were updated to use the **`qase()` function wrapper** instead of JSDoc comments. This is the officially recommended approach in cypress-qase-reporter documentation.

### Before (Problematic):
```typescript
describe('Authentication API Tests', () => {
  /**
   * @qaseId 18
   */
  it('should successfully register a new user', () => {
    // test code
  });
});
```

### After (Fixed):
```typescript
import { qase } from 'cypress-qase-reporter/dist/mocha';

describe('Authentication API Tests', () => {
  qase(18, it('should successfully register a new user', () => {
    // test code
  }));
});
```

## Files Updated

1. **API Tests:**
   - [test/cypress/e2e/api/auth.api.cy.ts](test/cypress/e2e/api/auth.api.cy.ts) - Tests 18-39 (22 tests)
   - [test/cypress/e2e/api/health.api.cy.ts](test/cypress/e2e/api/health.api.cy.ts) - Tests 40-44 (5 tests)

2. **UI Tests:**
   - [test/cypress/e2e/ui/login.cy.ts](test/cypress/e2e/ui/login.cy.ts) - Tests 1-8 (8 tests)
   - [test/cypress/e2e/ui/register.cy.ts](test/cypress/e2e/ui/register.cy.ts) - Tests 9-12 (4 tests)
   - [test/cypress/e2e/ui/logout.cy.ts](test/cypress/e2e/ui/logout.cy.ts) - Tests 13-17 (5 tests)

**Total: 44 test cases updated**

## Configuration Verified

The `cypress.config.ts` is correctly configured for Qase TestOps integration:

- ✅ Reporter: `cypress-qase-reporter` with `cypress-multi-reporters`
- ✅ Mode: `testops`
- ✅ Autocreate: `true` (automatically creates test cases if they don't exist)
- ✅ API token loaded from environment variables
- ✅ Project code: `ECP`

## How to Verify the Fix

1. **Run tests with Qase reporting:**
   ```bash
   cd test
   npm run test:api   # Run API tests
   npm run test:e2e   # Run E2E tests
   npm test           # Run all tests
   ```

2. **Check Qase.io dashboard:**
   - Navigate to your Qase project (ECP)
   - Look for test runs with timestamp of current execution
   - Test cases 1-44 should now appear as individual test cases (not just run results)
   - Each test case should show:
     - Test case ID (1-44)
     - Test title
     - Execution status (Passed/Failed)
     - Screenshots/videos (if applicable)

3. **Debug output:**
   - If `debug: true` is set in cypress.config.ts, the reporter will log detailed information
   - Output includes Qase API responses and test case mapping

## Key Changes Made

### Import Addition
```typescript
import { qase } from 'cypress-qase-reporter/dist/mocha';
```

### Test Wrapper Pattern
```typescript
qase(testId, it('test title', () => {
  // test body
}));
```

### Important Notes
- ✅ Works with `it.skip()` for skipped tests
- ✅ Maintains all existing test functionality
- ✅ Compatible with Mocha reporter hooks (before, after, beforeEach, afterEach)
- ✅ No changes to test logic or assertions

## Best Practices Going Forward

1. **Always use `qase()` wrapper** for new tests, not JSDoc comments
2. **Assign unique test IDs** in sequential order
3. **Use descriptive test titles** for clarity in Qase dashboard
4. **Keep `.env.local` secure** with API token (already in .gitignore)
5. **Verify test mapping** in Qase after significant test suite changes

## Environment Variables Required

The `.env.local` file must contain:
```
QASE_API_TOKEN=your_token_here
QASE_PROJECT=ECP
```

These are loaded in [cypress.config.ts](test/cypress.config.ts) line 42 and 44.

## Additional Resources

- [Cypress Qase Reporter Documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress)
- [Qase API Documentation](https://developers.qase.io/)
- [Project QASE_SETUP.md](test/QASE_SETUP.md)

---

**Fixed Date:** 2025-11-13
**Status:** ✅ All test files updated and ready for Qase integration
