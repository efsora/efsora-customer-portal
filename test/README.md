# Cypress Template with Page Object Model (POM)

A comprehensive, production-ready Cypress testing template implementing the Page Object Model (POM) design pattern. Supports both E2E and API testing with TypeScript, Docker support, and Qase.io integration.

## 🚀 Features

- ✅ **Page Object Model (POM)** - Clean separation of concerns with reusable page objects
- ✅ **TypeScript Support** - Full TypeScript implementation with type safety
- ✅ **E2E & API Testing** - Dedicated structure for both UI and API tests
- ✅ **Docker Ready** - Fully containerized with Docker and Docker Compose
- ✅ **Multiple Environments** - Easy configuration for dev, staging, and production
- ✅ **Qase.io Integration** - Test management and reporting with Qase.io
- ✅ **Custom Commands** - Extensive custom Cypress commands for common operations
- ✅ **Utility Functions** - Helpers for UI interactions, API calls, and data generation
- ✅ **Code Quality** - ESLint and Prettier configured
- ✅ **CI/CD Ready** - GitHub Actions workflow examples included
- ✅ **Example Tests** - Working examples for E2E and API tests

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Docker Usage](#docker-usage)
- [Configuration](#configuration)
- [Qase.io Integration](#qaseio-integration)
- [CI/CD](#cicd)
- [Contributing](#contributing)

## 📦 Prerequisites

- Node.js 18+ and npm
- Git
- (Optional) Docker Desktop for containerized testing

## 🛠️ Installation

### Local Setup

1. Clone or use this template:

```bash
git clone <repository-url>
cd cypress-template
```

2. Install dependencies:

```bash
npm install
```

3. Verify Cypress installation:

```bash
npx cypress verify
```

4. (Optional) Copy and configure environment file:

```bash
cp cypress.env.json.example cypress.env.json
# Edit cypress.env.json with your configuration
```

### Docker Setup

See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for detailed Docker instructions.

```bash
# Build Docker image
npm run docker:build

# Run tests in Docker
npm run docker:run
```

## 📁 Project Structure

```
cypress-template/
├── cypress/
│   ├── e2e/                    # E2E test specs
│   │   ├── login.cy.ts         # Login test examples
│   │   ├── home.cy.ts          # Home page test examples
│   │   └── api/                # API test specs
│   │       ├── users.api.cy.ts
│   │       └── products.api.cy.ts
│   ├── pages/                  # Page Object classes
│   │   ├── BasePage.ts         # Base page with common methods
│   │   ├── LoginPage.ts        # Login page object
│   │   └── HomePage.ts         # Home page object
│   ├── api/                    # API service classes
│   │   ├── BaseApiService.ts   # Base API service
│   │   ├── UserService.ts      # User API service
│   │   └── ProductService.ts   # Product API service
│   ├── support/                # Custom commands and utilities
│   │   ├── commands.ts         # Custom Cypress commands
│   │   └── e2e.ts              # E2E support file
│   ├── utils/                  # Utility functions
│   │   ├── uiHelpers.ts        # UI interaction helpers
│   │   ├── apiHelpers.ts       # API testing helpers
│   │   ├── dataGenerator.ts    # Test data generators
│   │   └── envConfig.ts        # Environment configuration
│   ├── fixtures/               # Test data files
│   │   ├── users.json
│   │   └── products.json
│   └── config/                 # Environment configs
│       ├── dev.json
│       ├── staging.json
│       └── prod.json
├── cypress.config.ts           # Cypress configuration
├── tsconfig.json               # TypeScript configuration
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Docker Compose orchestration
├── .eslintrc.json              # ESLint configuration
├── .prettierrc.json            # Prettier configuration
├── package.json                # Project dependencies and scripts
├── README.md                   # This file
├── DOCKER_GUIDE.md             # Docker usage guide
├── QASE_SETUP.md               # Qase.io integration guide
└── CONTRIBUTING.md             # Contribution guidelines

## 🧪 Running Tests

### Interactive Mode (Cypress UI)

```bash
npm run cypress:open
```

### Headless Mode

```bash
# Run all tests
npm test

# Run E2E tests only
npm run test:e2e

# Run API tests only
npm run test:api

# Run specific spec file
npm run test:spec -- cypress/e2e/login.cy.ts
```

### Different Browsers

```bash
npm run test:chrome
npm run test:firefox
npm run test:edge
```

### Environment-Specific Tests

```bash
npm run test:dev       # Development environment
npm run test:staging   # Staging environment
npm run test:prod      # Production environment
```

### Docker

```bash
npm run docker:test    # Run tests in Docker container
```

## ✍️ Writing Tests

### Creating a Page Object

Create a new file in `cypress/pages/`:

```typescript
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  private readonly selectors = {
    myButton: '[data-testid="my-button"]',
    myInput: '[data-testid="my-input"]',
  };

  constructor() {
    super('/my-page');
  }

  clickButton(): this {
    this.click(this.selectors.myButton);
    return this;
  }

  enterText(text: string): this {
    this.type(this.selectors.myInput, text);
    return this;
  }
}
```

### Writing E2E Tests

Create a new file in `cypress/e2e/`:

```typescript
import { MyPage } from '../pages/MyPage';

describe('My Feature', () => {
  let myPage: MyPage;

  beforeEach(() => {
    myPage = new MyPage();
    myPage.visit();
  });

  it('should do something', () => {
    myPage
      .enterText('test')
      .clickButton();

    // Assertions
    cy.url().should('include', '/success');
  });
});
```

### Creating an API Service

Create a new file in `cypress/api/`:

```typescript
import { BaseApiService } from './BaseApiService';

export class MyApiService extends BaseApiService {
  getItems(): Cypress.Chainable<Cypress.Response<any>> {
    return this.get('/items');
  }

  createItem(data: any): Cypress.Chainable<Cypress.Response<any>> {
    return this.post('/items', data);
  }
}
```

### Writing API Tests

Create a new file in `cypress/e2e/api/`:

```typescript
import { MyApiService } from '../../api/MyApiService';

describe('My API Tests', () => {
  let myApiService: MyApiService;

  before(() => {
    myApiService = new MyApiService();
  });

  it('should get items', () => {
    myApiService.getItems().then((response) => {
      myApiService.verifyStatus(response, 200);
      myApiService.verifyResponseIsArray(response);
    });
  });
});
```

## ⚙️ Configuration

### Environment Variables

Create a `cypress.env.json` file (use `cypress.env.json.example` as a template):

```json
{
  "apiUrl": "http://localhost:3000/api",
  "testUser": {
    "username": "testuser",
    "password": "password123"
  }
}
```

### Environment-Specific Config

Edit files in `cypress/config/` for different environments:

- `dev.json` - Development configuration
- `staging.json` - Staging configuration
- `prod.json` - Production configuration

## 📊 Qase.io Integration

For test management and reporting with Qase.io, see [QASE_SETUP.md](./QASE_SETUP.md).

Quick setup:

1. Install Qase reporter:
   ```bash
   npm install --save-dev cypress-qase-reporter
   ```

2. Set environment variables:
   ```bash
   export QASE_API_TOKEN=your_token
   export QASE_PROJECT_CODE=your_project
   ```

3. Uncomment Qase configuration in `cypress.config.ts`

4. Run tests:
   ```bash
   npm test
   ```

## 🐳 Docker Usage

Complete Docker guide available in [DOCKER_GUIDE.md](./DOCKER_GUIDE.md).

Quick commands:

```bash
# Build image
npm run docker:build

# Run tests
npm run docker:run

# Run in background
npm run docker:run:detached

# Stop containers
npm run docker:down

# Run specific tests
docker-compose run --rm cypress-tests npm run test:e2e
```

## 🔄 CI/CD

### GitHub Actions

A workflow file is provided in `.github/workflows/cypress.yml`:

```bash
# Tests run automatically on push and pull requests
git push origin main
```

### GitLab CI / Other CI Tools

See example configurations in [DOCKER_GUIDE.md](./DOCKER_GUIDE.md#cicd-integration).

## 🔧 Code Quality

### Linting

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors
```

### Formatting

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### Type Checking

```bash
npm run type-check    # Check TypeScript types
```

## 📚 Documentation

- [Docker Guide](./DOCKER_GUIDE.md) - Complete Docker setup and usage
- [Qase.io Setup](./QASE_SETUP.md) - Test management integration
- [Contributing](./CONTRIBUTING.md) - How to contribute to this template

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## 📝 License

MIT License - feel free to use this template for your projects!

## 🙏 Acknowledgments

- [Cypress](https://www.cypress.io/) - Modern web testing framework
- [Qase.io](https://qase.io/) - Test management platform
- [Docker](https://www.docker.com/) - Containerization platform

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Check existing documentation
- Review example tests for guidance

---

**Happy Testing! 🎉**
