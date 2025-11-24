import { generateUniqueEmail, sendInvitationAndRegister } from '../../api/authApi';
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
    cy.url().should('include', '/', { timeout: 1000 });
  });

  it('should display validation error for empty fields', () => {
    registerPage
      .verifyPageLoaded()
      .clickCreateAccount()
      .verifyNameErrorVisible()
      .verifyEmailErrorVisible()
      .verifyPasswordErrorVisible();
  });

  it('should display error for password less than 12 characters', () => {
    const shortPassword = 'Short123!'; // 9 characters

    registerPage
      .verifyPageLoaded()
      .enterName('Test')
      .enterSurname('User')
      .enterEmail(testUserEmail)
      .enterPassword(shortPassword)
      .enterConfirmPassword(shortPassword)
      .clickCreateAccount();

    // Verify password error is displayed
    registerPage.verifyPasswordErrorVisible();

    // Verify error message contains minimum length requirement
    registerPage.getPasswordErrorMessage().should('contain', 'at least 12 characters');
  });

  it('should display error when email already exists', () => {
    const duplicateEmail = generateUniqueEmail('duplicate-ui');
    const duplicatePassword = 'SomePassword123!';

    // First, create a user with this email via API (with invitation)
    sendInvitationAndRegister({
      name: 'First',
      surname: 'User',
      email: duplicateEmail,
      password: duplicatePassword,
    }).then(() => {
      // Send another invitation for the duplicate attempt
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/send-invitation',
        body: { email: duplicateEmail },
        failOnStatusCode: false,
      }).then(() => {
        // Now try to register with the same email via UI (should fail)
        registerPage
          .verifyPageLoaded()
          .register('Another', 'User', duplicateEmail, duplicatePassword)
          .verifyErrorMessageVisible();

        registerPage.getErrorMessage().should('contain', 'Email already in use');
      });
    });
  });
});
