# Contributing to Cypress Template

Thank you for your interest in contributing to this Cypress template! This document provides guidelines and standards for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/cypress-template.git
   cd cypress-template
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Before You Start

- Check existing issues and pull requests
- Create an issue to discuss major changes
- Ensure your Node.js version matches requirements

### Making Changes

1. Make your changes in your feature branch
2. Follow the coding standards (see below)
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation as needed

### Running Quality Checks

```bash
# Run all tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Run all checks
npm run lint && npm run type-check && npm test
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types; use proper type definitions
- Use interfaces for object shapes
- Export types/interfaces that may be reused

```typescript
// Good
interface User {
  id: number;
  username: string;
  email: string;
}

function getUser(id: number): User {
  // implementation
}

// Bad
function getUser(id: any): any {
  // implementation
}
```

### Page Objects

- One page object per file
- Extend `BasePage` class
- Use private `selectors` object for all selectors
- Prefer `data-testid` attributes over CSS selectors
- Return `this` for chainable methods
- Add JSDoc comments for public methods

```typescript
import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object for Login functionality
 */
export class LoginPage extends BasePage {
  private readonly selectors = {
    usernameInput: '[data-testid="username"]',
    passwordInput: '[data-testid="password"]',
    loginButton: '[data-testid="login-button"]',
  };

  constructor() {
    super('/login');
  }

  /**
   * Enter username
   * @param username - Username to enter
   */
  enterUsername(username: string): this {
    this.type(this.selectors.usernameInput, username);
    return this;
  }
}
```

### API Services

- One service per API resource
- Extend `BaseApiService` class
- Use private `endpoints` object for endpoint definitions
- Include verification methods
- Add JSDoc comments

```typescript
import { BaseApiService } from './BaseApiService';

/**
 * UserService - API service for user-related endpoints
 */
export class UserService extends BaseApiService {
  private readonly endpoints = {
    users: '/users',
    user: (id: number) => `/users/${id}`,
  };

  /**
   * Get all users
   */
  getAllUsers(): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.users);
  }
}
```

### Test Specs

- Descriptive test names
- Use `describe` for grouping related tests
- Use `beforeEach` for test setup
- One assertion concept per test
- Clean up after tests if needed

```typescript
describe('Login Functionality', () => {
  let loginPage: LoginPage;

  beforeEach(() => {
    loginPage = new LoginPage();
    loginPage.visit();
  });

  it('should successfully login with valid credentials', () => {
    loginPage.login('testuser', 'password123');
    cy.url().should('include', '/home');
  });

  it('should display error for invalid credentials', () => {
    loginPage.login('invalid', 'wrong');
    loginPage.verifyErrorMessage('Invalid credentials');
  });
});
```

### Naming Conventions

- **Files**: PascalCase for classes (`LoginPage.ts`), camelCase for utilities (`apiHelpers.ts`)
- **Classes**: PascalCase (`LoginPage`, `UserService`)
- **Methods**: camelCase (`enterUsername`, `getAllUsers`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Test files**: `*.cy.ts` suffix
- **Private members**: Prefix with underscore if needed, or use TypeScript `private` keyword

### Code Organization

- Group related functionality together
- Keep files focused and single-purpose
- Extract reusable logic into utilities
- Use barrel exports (`index.ts`) for clean imports

### Comments and Documentation

- Use JSDoc comments for public APIs
- Explain "why" not "what" in comments
- Keep comments up-to-date with code changes
- Add TODO comments for future improvements

```typescript
/**
 * Login user via API
 * This bypasses the UI for faster test setup
 * @param credentials - User credentials
 */
loginUser(credentials: Credentials): Chainable<Response> {
  // TODO: Add support for OAuth tokens
  return this.post('/auth/login', credentials);
}
```

## 🧪 Testing Guidelines

### Test Organization

- E2E tests in `cypress/e2e/`
- API tests in `cypress/e2e/api/`
- Group related tests in describe blocks
- Use meaningful test descriptions

### Test Quality

- Tests should be independent
- Tests should be repeatable
- Avoid hard-coded waits (`cy.wait(5000)`)
- Use proper assertions
- Clean up test data if needed

### Best Practices

```typescript
// Good - Use proper waits
cy.get('[data-testid="button"]').should('be.visible').click();

// Bad - Hard-coded waits
cy.wait(3000);
cy.get('[data-testid="button"]').click();

// Good - Specific assertions
expect(response.status).to.equal(200);
expect(response.body).to.have.property('id');

// Bad - Vague assertions
expect(response).to.exist;

// Good - Descriptive test names
it('should display validation error when email format is invalid', () => {
  // test code
});

// Bad - Unclear test names
it('should work', () => {
  // test code
});
```

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```
feat(api): add product search endpoint

Implement search functionality for products API service
with filtering and pagination support.

Closes #123
```

```
fix(login): correct password visibility toggle

The password toggle button was not working properly
due to incorrect selector. Updated to use data-testid.

Fixes #456
```

```
docs(readme): update installation instructions

Add Docker setup steps and clarify Node.js version requirements.
```

### Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 50 characters or less
- Reference issues and pull requests when applicable

## 🔄 Pull Request Process

### Before Submitting

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Run linting and formatting
5. Update CHANGELOG if applicable

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for new functionality
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. Submit pull request
2. Wait for CI checks to pass
3. Address reviewer feedback
4. Get approval from maintainer
5. Squash and merge when approved

### After Merge

- Delete your feature branch
- Update your local main branch
- Close related issues

## 🎯 Priority Areas for Contribution

- Additional example tests
- New utility functions
- Documentation improvements
- Bug fixes
- Performance improvements
- Accessibility testing examples
- Visual regression testing integration

## ❓ Questions?

- Open an issue for discussion
- Check existing documentation
- Review closed issues and PRs

## 🙏 Thank You!

Your contributions make this template better for everyone. Thank you for taking the time to contribute!
