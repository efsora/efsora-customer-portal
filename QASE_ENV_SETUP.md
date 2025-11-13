# Qase Environment Variables Setup Guide

## Problem
Environment variables from `.env.local` were not being properly loaded by Cypress, causing:
```
WARN[0000] The "QASE_API_TOKEN" variable is not set. Defaulting to a blank string.
WARN[0000] The "QASE_PROJECT_CODE" variable is not set. Defaulting to a blank string.
```

## Solution

### 1. Verify `.env.local` Exists and Has Correct Variables

Your `.env.local` should contain:
```bash
QASE_API_TOKEN=your_token_here
QASE_PROJECT=ECP
```

**Location:** `/test/.env.local` (relative to project root)

### 2. Fixed Cypress Configuration

The `cypress.config.ts` has been updated to:
- ✅ Use absolute paths for loading `.env.local`
- ✅ Log which variables are being loaded
- ✅ Verify variables are set before running tests
- ✅ Pass variables to Qase reporter plugin

**Key changes in `cypress.config.ts`:**
```typescript
// Load environment variables with absolute path
const envPath = path.resolve(__dirname, '.env.local');
const envResult = dotenv.config({ path: envPath });

// Debug logging
console.log(`QASE_API_TOKEN: ${process.env.QASE_API_TOKEN ? 'SET' : 'NOT SET'}`);
console.log(`QASE_PROJECT: ${process.env.QASE_PROJECT || 'NOT SET'}`);
```

### 3. Running Tests

Choose one of these methods:

#### Method 1: Using Shell Script (Recommended)
```bash
cd test
chmod +x run-tests.sh
./run-tests.sh
```

#### Method 2: Explicitly Export Variables
```bash
cd test
export QASE_API_TOKEN=$(grep QASE_API_TOKEN .env.local | cut -d'=' -f2)
export QASE_PROJECT=$(grep QASE_PROJECT .env.local | cut -d'=' -f2)
npm run test:api
```

#### Method 3: Load via Source (Bash)
```bash
cd test
source .env.local
npm run test:api
```

#### Method 4: Run Tests with Docker (Cleanest)
```bash
cd test
npm run docker:test
```

### 4. Verify Variables Are Loaded

When you run tests, you should see console output like:
```
Loading environment variables from: /path/to/test/.env.local
Successfully loaded .env.local with 2 variables
QASE_API_TOKEN: SET
QASE_PROJECT: ECP
Qase reporter configured - Token: SET, Project: ECP
```

### 5. Troubleshooting

#### Variables still not loading?
1. **Check file location:**
   ```bash
   ls -la test/.env.local
   ```
   Should show the file exists

2. **Check file contents:**
   ```bash
   cat test/.env.local
   ```
   Should show `QASE_API_TOKEN` and `QASE_PROJECT`

3. **Verify values are set:**
   ```bash
   grep QASE test/.env.local
   ```

4. **Check Node environment:**
   ```bash
   node -e "console.log(process.env.QASE_API_TOKEN)"
   ```
   If empty, the `.env.local` isn't being read by Node.js

#### Manually verify Qase token works:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.qase.io/v1/projects/ECP
```

### 6. Windows Users

If using PowerShell, load variables this way:
```powershell
# Load .env.local variables
$env:QASE_API_TOKEN = $(Select-String -Path ".env.local" -Pattern "QASE_API_TOKEN" | % {$_.Line.Split("=")[1]})
$env:QASE_PROJECT = $(Select-String -Path ".env.local" -Pattern "QASE_PROJECT" | % {$_.Line.Split("=")[1]})

# Run tests
npm run test:api
```

Or use the built-in `test/run-tests.sh` script via Git Bash.

### 7. CI/CD Integration

For GitHub Actions or other CI/CD, add these secrets:
```yaml
env:
  QASE_API_TOKEN: ${{ secrets.QASE_API_TOKEN }}
  QASE_PROJECT: ${{ secrets.QASE_PROJECT }}
```

Then run:
```bash
npm run test:api
```

## Next Steps

1. ✅ Run tests using one of the methods above
2. ✅ Check Qase dashboard for test results
3. ✅ Verify test cases 1-44 appear as individual cases
4. ✅ Confirm screenshots/videos are uploaded

## Related Files

- [cypress.config.ts](cypress.config.ts) - Updated with proper env variable loading
- [run-tests.sh](run-tests.sh) - Helper script to load variables and run tests
- [QASE_FIX_SUMMARY.md](../QASE_FIX_SUMMARY.md) - Original Qase fix documentation
- [test/.env.local](.env.local) - Your Qase credentials (keep secure!)

---

**Last Updated:** 2025-11-13
**Status:** Environment variables now properly loaded ✅
