# Qase.io Integration Setup

This guide explains how to integrate Qase.io test management with this Cypress template.

## Prerequisites

- Qase.io account
- API token from Qase.io
- Project code from your Qase.io project

## Installation

Install the Qase Cypress reporter:

```bash
npm install --save-dev cypress-qase-reporter
```

## Configuration

### 1. Update `cypress.config.ts`

Uncomment the Qase reporter configuration in `cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';

export default defineConfig({
  e2e: {
    // ... other config
    setupNodeEvents(on, config) {
      // Load environment-specific configuration
      const environment = config.env.environment || 'dev';
      const configFile = path.join(__dirname, 'cypress', 'config', `${environment}.json`);

      if (fs.existsSync(configFile)) {
        const envConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
        config.baseUrl = envConfig.baseUrl || config.baseUrl;
        config.env = { ...config.env, ...envConfig };
        console.log(`Loaded ${environment} environment configuration`);
      }

      // Qase.io reporter configuration
      require('cypress-qase-reporter/plugin')(on, config);

      return config;
    },
  },
  // Reporter configuration
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    apiToken: process.env.QASE_API_TOKEN,
    projectCode: process.env.QASE_PROJECT_CODE,
    runComplete: true,
    basePath: 'https://api.qase.io/v1',
  },
});
```

### 2. Set Environment Variables

Create a `.env` file in the project root (already in `.gitignore`):

```bash
QASE_API_TOKEN=your_qase_api_token_here
QASE_PROJECT_CODE=your_project_code_here
QASE_RUN_ID=optional_run_id
```

Or export them in your shell:

```bash
export QASE_API_TOKEN=your_token
export QASE_PROJECT_CODE=your_project_code
```

### 3. Add Qase IDs to Tests

Add Qase test case IDs to your test cases using the `qase()` function:

```typescript
import { qase } from 'cypress-qase-reporter/dist/mocha';

describe('Login Tests', () => {
  it(qase(1, 'should login successfully'), () => {
    // test code
  });

  it(qase(2, 'should show error for invalid credentials'), () => {
    // test code
  });
});
```

Or use JSDoc comments:

```typescript
describe('Login Tests', () => {
  /**
   * @qaseId 1
   */
  it('should login successfully', () => {
    // test code
  });
});
```

## Usage

### Running Tests with Qase Reporting

```bash
# Run all tests and report to Qase
npm test

# Run specific spec with Qase reporting
npm run test:spec -- cypress/e2e/login.cy.ts

# Run E2E tests only
npm run test:e2e

# Run API tests only
npm run test:api
```

### Create a New Test Run in Qase

You can create a new test run in Qase before running tests:

```bash
export QASE_RUN_ID=123  # Use an existing run ID
npm test
```

Or let the reporter create a new run automatically (if `runComplete: true` is set).

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Cypress Tests with Qase

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run Cypress tests
        env:
          QASE_API_TOKEN: ${{ secrets.QASE_API_TOKEN }}
          QASE_PROJECT_CODE: ${{ secrets.QASE_PROJECT_CODE }}
        run: npm test
```

### GitLab CI Example

```yaml
test:
  image: cypress/included:latest
  variables:
    QASE_API_TOKEN: $QASE_API_TOKEN
    QASE_PROJECT_CODE: $QASE_PROJECT_CODE
  script:
    - npm ci
    - npm test
```

## Configuration Options

### Reporter Options

- `apiToken` - Qase API token (required)
- `projectCode` - Qase project code (required)
- `runId` - Qase run ID to report to (optional)
- `runName` - Name for new test run (optional)
- `runDescription` - Description for new test run (optional)
- `runComplete` - Mark run as complete after tests (default: true)
- `basePath` - Qase API base path (default: https://api.qase.io/v1)
- `logging` - Enable logging (default: false)
- `uploadAttachments` - Upload screenshots and videos (default: false)

### Example with All Options

```typescript
reporterOptions: {
  apiToken: process.env.QASE_API_TOKEN,
  projectCode: process.env.QASE_PROJECT_CODE,
  runId: process.env.QASE_RUN_ID,
  runName: 'Automated Test Run',
  runDescription: 'Cypress E2E and API tests',
  runComplete: true,
  basePath: 'https://api.qase.io/v1',
  logging: true,
  uploadAttachments: true,
}
```

## Best Practices

1. **Use Qase IDs consistently** - Add Qase test case IDs to all test cases
2. **Create test cases in Qase first** - Define test cases in Qase before writing automation
3. **Use test suites** - Organize tests in Qase to match your spec file structure
4. **Store credentials securely** - Never commit API tokens to repository
5. **Use CI/CD secrets** - Store Qase credentials in your CI/CD platform's secrets
6. **Enable attachments for failures** - Set `uploadAttachments: true` to upload screenshots and videos
7. **Use run names** - Give meaningful names to test runs for easy identification

## Troubleshooting

### Tests not appearing in Qase

- Verify API token and project code are correct
- Check that test cases have Qase IDs
- Ensure reporter is properly configured in `cypress.config.ts`
- Check console for error messages

### Authentication errors

- Verify API token is valid and not expired
- Check that token has appropriate permissions
- Ensure environment variables are properly set

### Run not completing

- Verify `runComplete: true` is set in reporter options
- Check network connectivity to Qase API
- Review Qase API status

## Resources

- [Qase.io Documentation](https://docs.qase.io/)
- [Cypress Qase Reporter](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress)
- [Qase API Documentation](https://developers.qase.io/)
