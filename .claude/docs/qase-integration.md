# Qase Integration Guide

Complete guide to Qase test management integration with your Cypress test suite.

## Overview

This project integrates with **Qase.io** test management platform to:
- ✅ Auto-create test cases from Cypress tests
- ✅ Upload test results after each test run
- ✅ Sync test metadata (descriptions, preconditions, postconditions)
- ✅ Maintain centralized test documentation

## Architecture

### Components

1. **Qase Reporter Plugin** (`cypress-qase-reporter`)
   - Automatically captures test results
   - Uploads to Qase after test execution
   - Creates test runs and manages results

2. **Test Metadata Files** (`testCases.js`)
   - Store descriptions, preconditions, postconditions
   - Located in each test folder (`cypress/e2e/api/`, `cypress/e2e/ui/`)
   - Used for syncing to Qase test cases

3. **MCP Server** (`qase-mcp`) ⭐ PRIMARY
   - Model Context Protocol server for Qase
   - Provides tools for interacting with Qase API
   - Configured in `~/.claude.json`
   - **All metadata syncing goes through this**

4. **Claude Command** (`.claude/commands/sync-qase-metadata.md`)
   - User-friendly interface to MCP tools
   - Loads metadata from test files
   - Uses MCP to sync to Qase

## Configuration

### Environment Variables

Set in `test/.env`:
```env
QASE_TOKEN=your_api_token_here
QASE_PROJECT=ECP
QASE_MODE=testops
```

### Cypress Config

See `test/cypress.config.ts` for:
- Qase reporter configuration
- Plugin initialization
- Reporter options (create, autoCreate, complete flags)

## Test Metadata Structure

### Format

Each `testCases.js` file exports test metadata as objects:

```javascript
module.exports = {
  testGroupName: {
    'test name from cypress': {
      description: 'What this test verifies',
      precondition: 'Setup required before test',
      postcondition: 'Expected outcome after test',
    },
  },
};
```

### Example

**File:** `test/cypress/e2e/api/testCases.js`

```javascript
module.exports = {
  authTestCases: {
    'should successfully register a new user': {
      description: 'User should be able to register with valid name, email, and password',
      precondition: 'Backend API is running; Database is accessible',
      postcondition: 'User account is created; Authentication token is issued',
    },
  },
  healthTestCases: {
    'should return healthy status': {
      description: 'Health endpoint should return healthy status',
      precondition: 'Backend API is running and accessible',
      postcondition: 'Response status is 200 OK; Response includes status: "ok"',
    },
  },
};
```

## Syncing Metadata

### Using Claude Code Command (MCP)

```
/sync-qase-metadata
```

Then ask:
> "Sync all test metadata to Qase"

I'll use MCP server to:
1. Load metadata from `testCases.js` files
2. Fetch all test cases via `get_cases` MCP tool
3. Match by test name
4. Update each case via `update_case` MCP tool

### Using MCP Tools Directly

You can also ask me directly to use specific MCP tools:
- **get_cases** - Fetch test cases from project
- **get_case** - Get specific test case details
- **update_case** - Update test case metadata
- **get_runs** - Fetch test runs
- **create_result** - Create test result

Example:
> "Show me all test cases using get_cases"
> "Update case 46 with new description"

## Current Status

### Test Cases

| Suite | Count | Status |
|-------|-------|--------|
| API - Auth | 17 | ✅ Synced |
| API - Health | 5 | ✅ Synced |
| UI - Login | 10 | 📝 Pending |
| UI - Signup | 6 | 📝 Pending |
| UI - Logout | 6 | 📝 Pending |

**Total:** 44 test cases (22 API + 22 UI)

### Metadata Status

- ✅ **API tests**: All have descriptions, preconditions, postconditions
- ⏳ **UI tests**: Structure ready, awaiting metadata entry

## Adding New Tests

1. **Create test in Cypress**
   ```typescript
   it('should do something', () => {
     // test code
   });
   ```

2. **Add to testCases.js** in same folder
   ```javascript
   module.exports = {
     myTests: {
       'should do something': {
         description: '...',
         precondition: '...',
         postcondition: '...',
       },
     },
   };
   ```

3. **Sync metadata**
   ```
   /sync-qase-metadata
   Sync all test metadata to Qase
   ```

## Troubleshooting

### Tests not appearing in Qase

1. Check `QASE_TOKEN` and `QASE_PROJECT` in `test/.env`
2. Ensure `create: true` in Cypress config
3. Run sync command to update metadata

### Metadata not syncing

1. Verify metadata file format matches expected structure
2. Test names must match exactly between testCases.js and Qase
3. Check API token has appropriate permissions

### API Errors

- **401 Unauthorized**: Invalid or expired token
- **404 Not Found**: Project code doesn't exist
- **400 Bad Request**: Invalid metadata format

## Related Files

- Configuration: `test/cypress.config.ts`
- Environment: `test/.env`
- API Tests: `test/cypress/e2e/api/`
- UI Tests: `test/cypress/e2e/ui/`
- Sync Script: `.claude/scripts/sync-qase-metadata.js`
- Claude Command: `.claude/commands/sync-qase-metadata.md`
