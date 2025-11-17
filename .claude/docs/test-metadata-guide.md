# Test Metadata Guide

How to create, maintain, and sync test metadata in your Cypress tests.

## What is Test Metadata?

Test metadata provides documentation for each test case:

- **Description**: What the test verifies
- **Precondition**: Prerequisites before test runs
- **Postcondition**: Expected outcomes after test completes

This metadata gets synced to Qase for centralized test documentation.

## File Structure

### Location

Create `testCases.js` in the same folder as your Cypress test files:

```
test/cypress/e2e/
├── api/
│   ├── auth.api.cy.ts          ← Cypress test file
│   ├── health.api.cy.ts        ← Cypress test file
│   └── testCases.js            ← Metadata file (create this)
├── ui/
│   ├── login.ui.cy.ts
│   ├── signup.ui.cy.ts
│   ├── logout.ui.cy.ts
│   └── testCases.js            ← Metadata file (create this)
```

### File Format

```javascript
/**
 * Test Cases Metadata
 * Contains descriptions, preconditions, and postconditions for all tests
 */

module.exports = {
  // Group 1
  authTestCases: {
    'test name from cypress': {
      description: 'What this test does',
      precondition: 'Setup required',
      postcondition: 'Expected result',
    },
    'another test': {
      description: '...',
      precondition: '...',
      postcondition: '...',
    },
  },

  // Group 2
  healthTestCases: {
    'should return healthy status': {
      description: 'Health endpoint should return healthy status',
      precondition: 'Backend API is running',
      postcondition: 'Response includes status "ok"',
    },
  },
};
```

## Writing Good Metadata

### Description

- **Purpose**: Summary of what the test verifies
- **Format**: 1-2 sentences, clear and concise
- **Examples**:
  - ✅ "User should be able to register with valid credentials"
  - ✅ "Login should fail with incorrect password"
  - ❌ "Test registration" (too vague)
  - ❌ "Super long description that explains every single line of code..." (too detailed)

### Precondition

- **Purpose**: State required before test starts
- **Format**: Semicolon-separated conditions
- **Examples**:
  - ✅ "Backend API is running; Database is accessible; No existing user with test email"
  - ✅ "User account exists; Correct password is provided"
  - ❌ "Everything is setup" (too vague)

### Postcondition

- **Purpose**: Expected outcome after test passes
- **Format**: Semicolon-separated expected results
- **Examples**:
  - ✅ "User account is created; JWT token is issued; User can be queried by ID"
  - ✅ "Login fails with 401 Unauthorized; No token is issued"
  - ❌ "Test passes" (not specific enough)

## Example: Complete testCases.js

**File:** `test/cypress/e2e/api/testCases.js`

```javascript
/**
 * API Test Cases Metadata
 */

module.exports = {
  authTestCases: {
    'should successfully register a new user': {
      description: 'User should be able to register with valid name, email, and password',
      precondition: 'Backend API is running; Database is accessible; No existing user with same email',
      postcondition: 'User account is created; JWT token is issued; User queryable by ID',
    },
    'should return error when email already exists': {
      description: 'System should prevent duplicate email registration',
      precondition: 'Backend API is running; User already registered with unique email',
      postcondition: 'Registration fails with 409 Conflict; Original user account unchanged',
    },
    'should successfully login with valid credentials': {
      description: 'User should be able to login with correct email and password',
      precondition: 'Backend API is running; User account exists; Password is correct',
      postcondition: 'Login succeeds; JWT token issued; User information returned',
    },
  },

  healthTestCases: {
    'should return healthy status': {
      description: 'Health endpoint should return healthy status when backend running',
      precondition: 'Backend API is running and accessible',
      postcondition: 'Response status is 200 OK; Response includes status "ok"',
    },
  },
};
```

## Matching Test Names

**Critical**: Test names must match EXACTLY between `testCases.js` and Cypress test file.

### Correct Matching

**In Cypress file:**
```typescript
describe('Authentication', () => {
  it('should successfully register a new user', () => {
    // test code
  });
});
```

**In testCases.js:**
```javascript
authTestCases: {
  'should successfully register a new user': {
    description: '...',
    precondition: '...',
    postcondition: '...',
  },
}
```

### Common Mistakes

❌ **Wrong**: Metadata key doesn't match test name exactly
```javascript
authTestCases: {
  'should register a user': { ... }  // Missing "new" and "successfully"
}
```

❌ **Wrong**: Extra spaces or punctuation
```javascript
authTestCases: {
  'should successfully register a new user ': { ... }  // Extra space at end
}
```

✅ **Correct**: Exact match
```javascript
authTestCases: {
  'should successfully register a new user': { ... }
}
```

## Adding Metadata to Existing Tests

### Step 1: Create testCases.js

Create file in test folder:
```bash
touch test/cypress/e2e/api/testCases.js
```

### Step 2: Get Test Names

List all test names from your Cypress files:

```bash
# Example from auth.api.cy.ts
grep "it('should" test/cypress/e2e/api/auth.api.cy.ts
```

### Step 3: Add Metadata

Copy test names and add metadata:

```javascript
module.exports = {
  authTestCases: {
    'should successfully register a new user': {
      description: '...',
      precondition: '...',
      postcondition: '...',
    },
    'should return error when email already exists': {
      description: '...',
      precondition: '...',
      postcondition: '...',
    },
    // ... more tests
  },
};
```

### Step 4: Sync to Qase

Use Claude Code command:
```
/sync-qase-metadata
```

Then ask:
> "Sync all test metadata to Qase"

## Common Patterns

### Registration Tests

```javascript
'should successfully register with valid data': {
  description: 'New user should be able to register with valid credentials',
  precondition: 'API is running; No user exists with test email; Password meets requirements',
  postcondition: 'Account created; JWT token issued; User can login with credentials',
},
'should fail registration with invalid email': {
  description: 'Registration should reject invalid email format',
  precondition: 'API is running; Invalid email provided',
  postcondition: 'Request fails with 400; No account created; User receives error message',
},
```

### Authentication Tests

```javascript
'should successfully login': {
  description: 'User should be able to login with correct credentials',
  precondition: 'API is running; User account exists; Correct password provided',
  postcondition: 'Login succeeds; Token issued; User data returned',
},
'should fail login with wrong password': {
  description: 'Login should fail with incorrect password',
  precondition: 'API is running; User exists; Wrong password provided',
  postcondition: 'Login fails with 401; No token issued; User cannot access protected routes',
},
```

### API Endpoint Tests

```javascript
'should fetch user by ID': {
  description: 'API should return user data for valid user ID',
  precondition: 'API is running; Valid JWT token provided; User exists',
  postcondition: 'Response 200 OK; User data returned; No sensitive data exposed',
},
'should return 404 for non-existent user': {
  description: 'API should return 404 for invalid user ID',
  precondition: 'API is running; Valid token; Non-existent user ID provided',
  postcondition: 'Response 404 Not Found; Error message provided',
},
```

## Verification

### Check Metadata Loaded

Use the sync command:
```
/sync-qase-metadata
→ "Sync all test metadata to Qase"
```

Should output:
```
Found 2 testCases file(s)
  📄 Loading: api/testCases.js
  📄 Loading: ui/testCases.js
Loaded 24 test case definitions
✓ Matched: "test name"
  📝 Updating case X...
  ✅ Updated
```

### Check in Qase

1. Go to Qase.io → Your Project
2. Select a test case
3. Verify description, preconditions, postconditions are populated

## Tips

- **Keep it concise**: Use semicolons to separate multiple points
- **Be specific**: Mention exact HTTP status codes, error messages, etc.
- **Match exactly**: Test name in metadata must match Cypress test name
- **Update regularly**: Keep metadata in sync with test changes
- **Document edge cases**: Preconditions for boundary tests
- **Specify timeouts**: Include response time expectations in postcondition if relevant

## Need Help?

See:
- `test/cypress/e2e/api/testCases.js` - Full example for API tests
- `/sync-qase-metadata` - Command to sync to Qase
- `.claude/docs/qase-integration.md` - Full integration guide
