import { generateUniqueEmail } from '../../api/authApi';
import { RegisterPage } from '../../pages/RegisterPage';

describe('UI > Register Functionality', () => {
  let registerPage: RegisterPage;
  let testUserEmail: string;
  let testUserPassword: string;

  beforeEach(() => {
    registerPage = new RegisterPage();
    testUserEmail = generateUniqueEmail('register-test');
    testUserPassword = 'RegisterPassword123!';
    registerPage.visit();
  });

  it('should successfully register with valid credentials', () => {
    registerPage
      .verifyPageLoaded()
      .register('New', 'TestUser', testUserEmail, testUserPassword);

    // Verify redirect to home/login page or success message
    cy.url().should('include', '/', { timeout: 10000 });
  });

  it('should display validation error for empty fields', () => {
    registerPage
      .verifyPageLoaded()
      .clickCreateAccount()
      .verifyNameErrorVisible()
      .verifyEmailErrorVisible()
      .verifyPasswordErrorVisible();
  });

  it('should display error when email already exists', () => {
    // Try to register with an email that was already registered
    registerPage
      .verifyPageLoaded()
      .register('Another', 'User', 'testuser.dev@example.com', 'SomePassword123!')
      .verifyErrorMessageVisible();

    registerPage.getErrorMessage().should('contain', 'Email already in use');
  });

  it('should navigate to login page', () => {
    registerPage
      .verifyPageLoaded()
      .clickSignIn();

    cy.url().should('include', '/login');
  });
});
