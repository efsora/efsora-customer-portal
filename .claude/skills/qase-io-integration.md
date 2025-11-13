# Qase.io Integration Setup

Setup guide for integrating Qase.io test management with your Cypress test suite.

## Overview

Qase.io is a test management platform that:
- Tracks test cases and their results
- Manages test runs and history
- Provides test reporting and analytics
- Integrates with CI/CD pipelines
- Works with Cypress via `cypress-qase-reporter`

## Step 1: Install Dependencies

```bash
cd test

# Install the Qase.io reporter for Cypress
npm install --save-dev cypress-qase-reporter

# Verify installation
npm list cypress-qase-reporter
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the `test/` directory:

```env
# Qase.io Configuration
QASE_API_TOKEN=your_api_token_here
QASE_PROJECT=ECP
QASE_MODE=testops
```

**Getting your API Token:**
1. Go to [Qase.io](https://qase.io/)
2. Sign in or create an account
3. Navigate to Settings → API Tokens
4. Create a new token and copy it
5. Paste into `QASE_API_TOKEN`

**Project Code:**
- Default: `ECP` (efsora-customer-portal)
- Change if your Qase project uses a different code

## Step 3: Update Cypress Configuration

The reporter is already configured in `cypress.config.ts`. Ensure the setupNodeEvents includes:

```typescript
setupNodeEvents(on, config) {
  // ... existing setup code ...

  // Enable Qase reporter plugin
  require('cypress-qase-reporter/plugin')(on, config);

  return config;
}
```

## Step 4: Add Test Case IDs to Tests

Tag your tests with Qase case IDs using `@CaseID` comments:

```typescript
describe('Login Functionality', () => {
  // Link to case ID C123 in Qase
  it('@C123 should successfully login with valid credentials', () => {
    // test code
  });

  // Multiple case IDs
  it('@C124 @C125 should display validation errors', () => {
    // test code
  });
});
```

**Finding Case IDs:**
1. Go to Qase.io → Your Project → Test Cases
2. Click a test case to see its ID (C123, etc.)
3. Add `@CID` prefix to your test name

## Step 5: Run Tests with Qase Reporting

### Local Development

```bash
cd test

# Run tests with Qase reporting
QASE_API_TOKEN=your_token npm run cypress:run

# Or with all env vars
QASE_API_TOKEN=your_token QASE_PROJECT=ECP npm run cypress:run
```

### With Docker

```bash
# Add to docker-compose.dev.yml for Cypress service
environment:
  - QASE_API_TOKEN=${QASE_API_TOKEN}
  - QASE_PROJECT=${QASE_PROJECT}
```

Then run:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
npm run docker:test
```

## Step 6: Verify Integration

1. Run a test: `npm run test:spec -- "cypress/e2e/ui/login.cy.ts"`
2. Go to Qase.io → Your Project → Runs
3. Look for a new test run with results

## Environment-Specific Configuration

Update `test/cypress/config/` files for different environments:

```json
// test/cypress/config/dev.json
{
  "baseUrl": "http://localhost:5174",
  "apiUrl": "http://localhost:3000/api"
}

// test/cypress/config/staging.json
{
  "baseUrl": "https://staging.app.com",
  "apiUrl": "https://staging-api.app.com"
}
```

Run tests for specific environment:
```bash
npm run test:dev     # Uses dev.json config
npm run test:staging # Uses staging.json config
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests with Qase

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd test
          npm install

      - name: Run Cypress tests
        env:
          QASE_API_TOKEN: ${{ secrets.QASE_API_TOKEN }}
          QASE_PROJECT: ECP
        run: |
          cd test
          npm run cypress:run

      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-artifacts
          path: |
            test/cypress/videos/
            test/cypress/screenshots/
```

### Store Secrets

1. Go to GitHub → Repository → Settings → Secrets
2. Add `QASE_API_TOKEN` with your API token value

## Reporter Output

When tests run with Qase integration, you'll see:
- Console output showing upload progress
- Test results uploaded to Qase.io
- Video/screenshot attachments (if configured)
- Test run link in Qase dashboard

## Troubleshooting

### "QASE_API_TOKEN not found"
- Check `.env.local` exists in `test/` directory
- Verify token is correct in Qase.io settings
- Ensure environment variables are loaded before running tests

### "Project not found"
- Verify project code matches Qase.io (default: ECP)
- Check if project exists in your Qase.io workspace
- Update `QASE_PROJECT` env var if needed

### Tests not appearing in Qase
- Verify case IDs are correct format: `@C123`
- Check test names contain case ID
- Run with debug flag: `DEBUG=true npm run cypress:run`

### Slow test uploads
- Videos/screenshots take time to upload
- Set `uploadDelay: 10` in config (already configured)
- For CI, consider uploading separately

## Useful NPM Scripts

Add to `test/package.json` for convenience:

```json
"scripts": {
  "test:qase": "QASE_API_TOKEN=${QASE_API_TOKEN} npm run cypress:run",
  "test:qase:ui": "QASE_API_TOKEN=${QASE_API_TOKEN} npm run test:e2e",
  "test:qase:headed": "QASE_API_TOKEN=${QASE_API_TOKEN} npm run cypress:run:headed"
}
```

## Documentation Links

- [Qase.io Documentation](https://docs.qase.io/)
- [cypress-qase-reporter GitHub](https://github.com/qase-tms/cypress-qase-reporter)
- [Qase Reporter Configuration](https://docs.qase.io/apps/reporters/cypress)
