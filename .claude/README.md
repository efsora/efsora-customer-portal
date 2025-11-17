# Claude Code Configuration

This folder contains Claude Code configurations, custom commands, scripts, and documentation for this project.

## Folder Structure

```
.claude/
├── README.md                           ← You are here
├── commands/                           ← Custom slash commands
│   └── sync-qase-metadata.md          ← Command to sync test metadata to Qase
├── scripts/                            ← Utility scripts
│   └── sync-qase-metadata.js          ← Script for syncing metadata (Node.js)
└── docs/                               ← Documentation
    ├── qase-integration.md            ← Full Qase integration guide
    └── test-metadata-guide.md         ← How to write test metadata
```

## Quick Start

### 1. Sync Test Metadata to Qase (MCP)

```
/sync-qase-metadata
```

Then ask: "Sync all test metadata to Qase"

**Uses MCP Server** for all operations - no direct API calls needed.

### 2. Add Metadata to New Tests

1. Create `testCases.js` in your test folder
2. Add metadata for each test
3. Use `/sync-qase-metadata` command

See: `.claude/docs/test-metadata-guide.md`

### 3. View Qase Integration Details

See: `.claude/docs/qase-integration.md`

## Custom Commands

### sync-qase-metadata

**File**: `.claude/commands/sync-qase-metadata.md`

**Usage**: Type `/sync-qase-metadata` then ask to sync metadata

**What it does**:
- Syncs test metadata from `testCases.js` files to Qase test cases
- Matches tests by name
- Updates description, preconditions, postconditions

**Examples**:
- "Sync all test metadata to Qase"
- "Update test case 46 with..."
- "Add metadata for new tests"

## Scripts

### sync-qase-metadata.js

⚠️ **DEPRECATED** - Use MCP Server instead

**File**: `.claude/scripts/sync-qase-metadata.js`

**Status**: Kept as fallback only. All syncing now uses MCP server via `/sync-qase-metadata` command.

**Previous usage** (no longer recommended):
```bash
cd project-root
node .claude/scripts/sync-qase-metadata.js
```

**Why MCP is better**:
- ✅ Integrated with Claude Code
- ✅ No token management in scripts
- ✅ Consistent with project setup
- ✅ Secure (token in `~/.claude.json`)
- ✅ No external dependencies needed

**Use instead**: `/sync-qase-metadata` command

## Documentation

### qase-integration.md

Complete guide covering:
- Architecture overview
- Configuration setup
- Test metadata structure
- How to sync
- Current status
- Troubleshooting

### test-metadata-guide.md

Comprehensive guide for:
- Creating testCases.js files
- Writing good metadata
- Matching test names exactly
- Adding metadata to existing tests
- Common patterns
- Verification

## Environment Setup

### Qase API Configuration

Set these in `test/.env`:

```env
QASE_TOKEN=your_api_token_here
QASE_PROJECT=ECP
QASE_MODE=testops
```

### MCP Server

Qase MCP server is configured in `~/.claude.json`:

```json
{
  "mcpServers": {
    "qase-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mcp-qase/build/index.js"],
      "env": {
        "QASE_API_TOKEN": "your_token"
      }
    }
  }
}
```

## Test Metadata Files

Located in test folders:

- ✅ `test/cypress/e2e/api/testCases.js` - 22 API tests
- ✅ `test/cypress/e2e/ui/testCases.js` - Ready for UI tests

## Related Project Files

- **Test Configuration**: `test/cypress.config.ts`
- **Environment**: `test/.env` (QASE_TOKEN, QASE_PROJECT)
- **Test Suites**: `test/cypress/e2e/api/`, `test/cypress/e2e/ui/`
- **npm Scripts**: `test/package.json`
  - ⚠️ `npm run sync:qase` - DEPRECATED (use `/sync-qase-metadata`)
  - `npm run test:api` - Run API tests
  - `npm run test:e2e` - Run all tests

## Workflow

### Adding New Tests

1. **Write test in Cypress**
   ```typescript
   it('should do something', () => { ... });
   ```

2. **Add metadata in testCases.js**
   ```javascript
   'should do something': {
     description: '...',
     precondition: '...',
     postcondition: '...',
   }
   ```

3. **Sync to Qase**
   ```
   /sync-qase-metadata
   Sync all test metadata to Qase
   ```

4. **Verify in Qase**
   - Go to Qase.io
   - Open test case
   - Check metadata is populated

## Troubleshooting

### Command not appearing

- Make sure you're in the project root
- Run `claude` to refresh CLI
- Commands in `.claude/commands/` should auto-discover

### MCP Server not connecting

1. Verify Qase MCP server configured in `~/.claude.json`
2. Check MCP server build file exists
3. Restart Claude Code
4. Check `QASE_API_TOKEN` in config

### Metadata not syncing

1. Check test names match exactly between test file and `testCases.js`
2. Verify metadata file exports correctly
3. Ask me to fetch cases first: "Get all test cases"
4. Check MCP server logs if available

### Qase API Errors

- **401**: Invalid API token in `~/.claude.json`
- **404**: Project code incorrect (should be `ECP`)
- **400**: Invalid metadata format in testCases.js

See `.claude/docs/qase-integration.md` for more help.

## Current Status

| Component | Status | Details |
|-----------|--------|---------|
| API Tests | ✅ Ready | 22 tests, all synced |
| UI Tests | ⏳ Pending | Structure ready, awaiting metadata |
| Metadata Files | ✅ Created | `testCases.js` in each folder |
| Sync Command | ✅ Working | Use `/sync-qase-metadata` |
| MCP Server | ✅ Configured | Qase integration active |
| Documentation | ✅ Complete | Full guides in `.claude/docs/` |

## Next Steps

- [ ] Add metadata for UI tests
- [ ] Run full test suite to validate
- [ ] Integrate sync into CI/CD pipeline
- [ ] Monitor Qase metrics

---

For detailed information, see the documentation files:
- `.claude/docs/qase-integration.md` - Full integration guide
- `.claude/docs/test-metadata-guide.md` - Metadata best practices
