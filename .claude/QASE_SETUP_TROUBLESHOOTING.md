# Qase Setup Troubleshooting

## Issue

The sync is failing with MCP 400 error when trying to fetch test cases from Qase.

## Root Causes

1. **Invalid or Expired Token**
   - The QASE_API_TOKEN in `.claude/.claude.json` might be invalid or expired

2. **API Endpoint Issues**
   - The Qase API might have changed
   - The MCP server might not be properly connected

3. **Token Permission Issues**
   - The token might not have permission to read test cases

## Solution

### Step 1: Verify Token
Your current token in `.claude/.claude.json`:
```
07ee1ece4839a988cc9f89d11c44492a986eb512178d04462f31fc046c82ec11
```

### Step 2: Generate New Token (if needed)
1. Go to https://app.qase.io/
2. Navigate to **Settings** → **API Tokens**
3. Create a new token with these scopes:
   - `cases:read`
   - `cases:write`
   - `runs:read`
   - `runs:write`
4. Copy the token

### Step 3: Update Configuration
Replace the token in `.claude/.claude.json`:

```json
{
  "mcpServers": {
    "qase-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/Users/tolgaerdonmez/desktop/mcp-servers/qase/mcp-qase/build/index.js"],
      "env": {
        "QASE_API_TOKEN": "YOUR_NEW_TOKEN_HERE"
      }
    }
  },
  "tools": {
    "auto_approve": [
      "mcp__qase-mcp__get_cases",
      "mcp__qase-mcp__update_case",
      // ... other tools
    ]
  }
}
```

### Step 4: Test Connection
Once updated, try syncing again:
```
/sync-qase-metadata
```

## Alternative Approach

If Qase API is not available, we can:
1. **Create manual update script** - Batch JSON file for manual updates
2. **Use Qase Web UI** - Copy-paste metadata manually to test cases
3. **Disable Qase integration** - Continue testing without Qase sync

## Files Related to Qase Setup

- `.claude/.claude.json` - MCP server configuration
- `.claude/commands/sync-qase-metadata.md` - Sync command documentation
- `.claude/scripts/sync-qase.js` - Metadata loader script
- `.claude/scripts/execute-sync.js` - Sync executor

## Status

Currently:
- ✅ Metadata loaded: 24 test cases
- ✅ MCP server configured
- ✅ Auto-approval configured
- ❌ API connection failing (400 error)

Fix needed: Verify/update Qase API token
