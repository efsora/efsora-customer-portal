# Qase Integration Logging Guide

This guide explains the comprehensive logging system for debugging Qase test case integration.

## Log Sections

### 1. SETUP Phase
```
📍 [SETUP] Initializing Qase metadata collection hook...
✅ [SETUP] Qase metadata hook initialized successfully
📍 [SETUP] Initializing Qase reporter plugin...
✅ [SETUP] Qase reporter plugin initialized successfully
```

**What to look for:**
- Both hooks should initialize successfully
- If either fails, check the error message immediately below
- Missing or failed setup is the most common cause of tests not being reported

### 2. PREPROCESSOR Phase
```
✅ [PREPROCESSOR] Loaded test file: /path/to/spec.cy.ts
```

**What to look for:**
- Each test file should appear here
- If a test file is missing, Cypress may have failed to compile it
- Check for TypeScript errors in the file

### 3. BEFORE_RUN Phase
```
📝 [BEFORE_RUN] Starting test run
   Specs to run: 2
     - auth.api.cy.ts
     - health.api.cy.ts
```

**What to look for:**
- Shows how many spec files will be run
- Confirms specs are being discovered
- If count is 0 or specs are missing, check the glob pattern in package.json

### 4. BEFORE_SPEC Phase
```
📄 [BEFORE_SPEC] Starting spec: auth.api.cy.ts
   Relative path: cypress/e2e/api/auth.api.cy.ts
```

**What to look for:**
- Each spec file should have this marker before tests run
- Shows the spec is loaded and ready

### 5. TEST_SUITE Phase
```
🧪 [TEST_SUITE] Starting test suite...
```

**What to look for:**
- Indicates the test file is being executed
- Comes after BEFORE_SPEC

### 6. TEST_START/TEST_END Phase
```
▶️  [TEST_START] API > Authentication API Tests > should successfully register a new user
✅ [TEST_END] should successfully register a new user (passed) - 97ms
```

**What to look for:**
- Each test should have both START and END markers
- Duration shows how long the test took
- Status should be "passed" or "failed"
- Missing END markers indicate test execution was interrupted

### 7. AFTER_SPEC Phase
```
📤 [AFTER_SPEC] Processing spec results: auth.api.cy.ts
───────────────────────────────────────────────────────────────
   Tests: 8
   Passing: 8
   Failing: 0
   Duration: 1234ms

   📋 Test Results:
      1. should successfully register a new user [passed]
      2. should return error when email already exists [passed]
      ...

   Calling afterSpecHook...
✅ [AFTER_SPEC] Spec results processed and queued for upload: auth.api.cy.ts
```

**What to look for:**
- `Tests:`, `Passing:`, `Failing:` counts should match actual tests
- Test results list should show all tests with their states
- If `No stats available`, the spec failed to run at all
- Check for errors between "Calling afterSpecHook..." and the success message

### 8. FINAL_RESULTS Phase
```
📊 [FINAL_RESULTS] Cypress run finished
════════════════════════════════════════════════════════════════
   Total specs run: 2
   Total tests: 40
   Passes: 40
   Failures: 0
   Duration: 5678ms
════════════════════════════════════════════════════════════════
```

**What to look for:**
- Total counts should match expectations
- Failures should be 0 (or expected count)
- Confirms entire run completed

## Troubleshooting Checklist

### Issue: Tests run but don't appear in Qase

1. **Check SETUP phase**
   - Are both metadata hook and reporter plugin initialized? ✅
   - If not, re-run and check error messages

2. **Check TEST_START/END markers**
   - Do all tests have both markers?
   - If missing END markers, tests are failing before completion

3. **Check AFTER_SPEC phase**
   - Do the test counts match reality?
   - Is "Calling afterSpecHook..." followed by success?
   - If there's an error after "Calling afterSpecHook...", include it in bug reports

4. **Check Qase API**
   - Look for API call logs (if available)
   - Verify token is valid (should show ✅ in SETUP)
   - Check project code matches (should show "ECP")

### Issue: Tests are being submitted but not linked to Qase test cases

1. **Verify qase() decorator usage**
   - Check your test files use `qase(ID, it(...))`
   - Example: `qase(123, it('test name', () => { ... }))`

2. **Check metadata collection**
   - Each test should have metadata associated
   - Look for any metadata-related errors in logs

3. **Verify test IDs**
   - Test IDs in qase() should exist in your Qase project
   - Check the ID number is correct

### Issue: No tests appear in Qase at all

1. **Check run creation**
   - Look for "Creating new run" or "Reporting to Run: #XX"
   - If neither appears, Qase configuration may be missing

2. **Check run status**
   - Look for `complete: false` in logs
   - If you see `complete: true`, the run is closed and won't accept results

3. **Verify API token**
   - Should show `✅ SET` in Qase Configuration section
   - If `❌ NOT SET`, check `.env.local` file

## Sample Log Output Locations

### Good Run Example
```
════════════════════════════════════════════════════════════════
📍 [SETUP] Initializing Qase metadata collection hook...
════════════════════════════════════════════════════════════════
✅ [SETUP] Qase metadata hook initialized successfully
📍 [SETUP] Initializing Qase reporter plugin...
✅ [SETUP] Qase reporter plugin initialized successfully
════════════════════════════════════════════════════════════════

✅ [PREPROCESSOR] Loaded test file: /Users/.../auth.api.cy.ts

════════════════════════════════════════════════════════════════
📝 [BEFORE_RUN] Starting test run
   Specs to run: 1
     - auth.api.cy.ts
════════════════════════════════════════════════════════════════

🧪 [TEST_SUITE] Starting test suite...
▶️  [TEST_START] API > Authentication API Tests > should successfully register a new user
✅ [TEST_END] should successfully register a new user (passed) - 97ms

────────────────────────────────────────────────────────────────
📤 [AFTER_SPEC] Processing spec results: auth.api.cy.ts
────────────────────────────────────────────────────────────────
   Tests: 1
   Passing: 1
   Failing: 0
   Duration: 97ms

   Calling afterSpecHook...
✅ [AFTER_SPEC] Spec results processed and queued for upload: auth.api.cy.ts

════════════════════════════════════════════════════════════════
📊 [FINAL_RESULTS] Cypress run finished
   Total tests: 1
   Passes: 1
   Failures: 0
════════════════════════════════════════════════════════════════
```

## Saving Logs for Analysis

To capture logs for troubleshooting:

```bash
# Redirect all output to a file
npm run test:api 2>&1 | tee test-run-$(date +%s).log

# Then review with:
grep -E "\[SETUP\]|\[AFTER_SPEC\]|\[FINAL_RESULTS\]" test-run-*.log
```

## Interpreting Qase Metadata

The metadata hooks track:
- **Test Discovery**: When tests are found and their Qase IDs
- **Test Execution**: When tests run and their results
- **Result Submission**: When results are sent to Qase API

If you see no test cases in Qase despite logs showing execution, the issue is likely:
1. Metadata not being collected (check metadata hook logs)
2. Results not being sent (check AFTER_SPEC errors)
3. Token/project mismatch (check Qase Configuration)
