# Qase Metadata Sync Implementation

## Overview

When `/sync-qase-metadata` command is called, Claude Code should automatically:

1. **Load metadata** from all `testCases.js` files in `test/cypress/e2e/`
2. **Fetch test cases** from Qase using `mcp__qase-mcp__get_cases()`
3. **Match by name** - for each Qase test case, find matching metadata
4. **Update matched cases** using `mcp__qase-mcp__update_case()`
5. **Report results** with summary of updated/skipped/failed counts

## Metadata File Structure

Test metadata files are organized as:

```javascript
module.exports = {
  suiteTestCases: {
    'test name exactly as it appears in Qase': {
      description: 'What the test does',
      precondition: 'Setup required',
      postcondition: 'Expected result',
    },
  },
};
```

## MCP Functions to Use

### 1. Get all test cases from Qase project

```javascript
mcp__qase-mcp__get_cases({
  code: "ECP",  // From QASE_PROJECT env var
  limit: 300
})
```

### 2. Update a test case

```javascript
mcp__qase-mcp__update_case({
  code: "ECP",  // Project code
  id: 46,       // Test case ID
  description: "Updated description",
  preconditions: "Setup required",
  postconditions: "Expected result"
})
```

## Implementation Steps

### Step 1: Load Metadata

Use Node.js (or JavaScript) to:
- Recursively find all `test/cypress/e2e/**/testCases.js` files
- Require/import each file
- Merge all test case objects into a single metadata map

```javascript
const metadata = {
  'should successfully register a new user': {
    description: '...',
    precondition: '...',
    postcondition: '...',
  },
  // ... more test cases
};
```

### Step 2: Fetch Qase Test Cases

Call `mcp__qase-mcp__get_cases()` to get all test cases from project.

### Step 3: Match and Update

For each test case from Qase:
- Look up test name in metadata map
- If found, call `mcp__qase-mcp__update_case()` to update
- If not found, skip

### Step 4: Report

Print summary:
```
✅ Updated: 22
⊘ Skipped:  22
❌ Failed:   0
```

## Important Notes

- **No prompts** - All updates happen automatically
- **Batch operations** - Consider batching updates to avoid rate limiting
- **Error handling** - Catch and log individual update failures, don't stop on first error
- **Logging** - Show which test case is being updated and result
- **Idempotent** - Can be run multiple times safely

## Example Output

```
╔════════════════════════════════════════╗
║  Syncing Qase Test Metadata            ║
╚════════════════════════════════════════╝

📂 Loading test metadata...
✅ Loaded 44 test cases

🔄 Fetching test cases from Qase...
✅ Found 44 test cases in Qase

📝 Updating test case metadata:

✅ Updated: "should successfully register a new user" (ID: 1)
✅ Updated: "should return error when email already exists" (ID: 2)
...

╔════════════════════════════════════════╗
║  Sync Complete                         ║
╚════════════════════════════════════════╝
Updated: 44
Skipped:  0
Failed:   0
Total:   44
```

## When to Run

The `/sync-qase-metadata` command should be manually triggered by the user:

```
User: "Sync all test metadata to Qase"
User: "Sync"
User: "/sync-qase-metadata"
```

All three should trigger the same automatic sync without any confirmation prompts.
