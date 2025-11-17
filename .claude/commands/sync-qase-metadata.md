# Sync Qase Test Metadata

Automatically sync test metadata to Qase test cases using MCP server.

## What This Does

- Loads metadata from `test/cypress/e2e/**/testCases.js` files
- Fetches all test cases from Qase via MCP
- Matches by test name
- Updates description, preconditions, postconditions for each match
- **Runs completely automatically without prompts**

## How to Use

Just say:
> "Sync all test metadata to Qase"

That's it! The sync will run automatically and update all matching test cases.

## Test Metadata Files

- ✅ `test/cypress/e2e/api/testCases.js` - API tests metadata
- ✅ `test/cypress/e2e/ui/testCases.js` - UI tests metadata

Each file exports objects with test names as keys and metadata objects as values:

```javascript
module.exports = {
  myTestCases: {
    'should do something': {
      description: 'What this test does',
      precondition: 'Setup required',
      postcondition: 'Expected result',
    },
  },
};
```

## Automatic Process

1. Load all test metadata from testCases.js files
2. Fetch all test cases from Qase project via MCP
3. For each Qase test case:
   - If test name matches metadata → **Update automatically**
   - If no match → Skip
4. Print summary of updated/skipped/failed cases

---

**No prompts. No confirmations. Fully automatic.**
