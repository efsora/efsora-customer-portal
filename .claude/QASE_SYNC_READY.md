# Qase Metadata Sync - Ready to Use

## Status: ✅ Ready

Everything is configured to automatically sync test metadata to Qase using MCP.

## Setup Confirmed

✅ **MCP Server**: Qase MCP server configured in `.claude/commands/` with API token
✅ **Auto-approval**: `get_cases` and `update_case` tools are auto-approved (no prompts)
✅ **Metadata files**:
  - `test/cypress/e2e/api/testCases.js`
  - `test/cypress/e2e/ui/testCases.js`

## How to Use

### Command 1: Use the custom command
```
/sync-qase-metadata
```

### Command 2: Ask in natural language
```
"Sync all test metadata to Qase"
"Sync test cases"
"Update Qase with test metadata"
```

## What Happens Automatically

When sync is triggered, Claude Code will:

1. **Load metadata** from all `testCases.js` files
   - Recursively finds files in `test/cypress/e2e/**`
   - Parses test names and their metadata

2. **Fetch from Qase** using `mcp__qase-mcp__get_cases`
   - Gets all 44 test cases from project ECP
   - No prompt required (auto-approved)

3. **Match and Update**
   - For each test case, finds matching metadata by name
   - Calls `mcp__qase-mcp__update_case` to update:
     - `description`
     - `preconditions`
     - `postconditions`

4. **Report Results**
   - Shows which test cases were updated
   - Displays summary (updated/skipped/failed counts)
   - No user confirmation needed

## Expected Output

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
[... 42 more updates ...]

╔════════════════════════════════════════╗
║  Sync Complete                         ║
╚════════════════════════════════════════╝
Updated: 44
Skipped:  0
Failed:   0
Total:   44
```

## Key Points

- ✅ **Automatic** - No prompts, no confirmations
- ✅ **Fast** - Batch updates using MCP
- ✅ **Safe** - Only updates matching test cases by name
- ✅ **Idempotent** - Can be run multiple times safely
- ✅ **MCP-only** - No direct API calls, uses MCP server

## Removed

- ❌ Direct API scripts
- ❌ `sync:qase` npm command
- ❌ `qase:create` npm command
- ❌ `after:run` hook for auto-sync

## Next Steps

Just ask to sync! The command is ready to execute.
