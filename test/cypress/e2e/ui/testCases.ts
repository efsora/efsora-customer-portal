/**
 * UI Test Cases Metadata
 * Contains descriptions, preconditions, and postconditions for all UI tests
 */

export interface TestCaseMetadata {
  description: string;
  precondition: string;
  postcondition: string;
}

// Registration UI Tests Metadata
export const registrationTestCases: Record<string, TestCaseMetadata> = {
  'should successfully register with valid credentials': {
    description: 'User should be able to complete registration form with valid name, email, and password and be redirected after successful registration',
    precondition: 'User is on the registration page; Frontend is accessible; No user with the test email exists; All required form fields are empty',
    postcondition: 'Registration form is submitted; User is redirected to home/login page; Success response is received; User account is created in the system',
  },
  'should display validation error for empty fields': {
    description: 'Registration form should display validation errors when user attempts to submit without filling required fields',
    precondition: 'User is on the registration page; All form fields are empty; User clicks Create Account button',
    postcondition: 'Validation error messages are displayed for name, email, and password fields; Form is not submitted; User remains on registration page',
  },
  'should display error when email already exists': {
    description: 'Registration form should display an error message when attempting to register with an email that already exists',
    precondition: 'User is on the registration page; An account with the test email already exists; User fills form with existing email',
    postcondition: 'Form submission fails; Error message "Email already in use" is displayed; User remains on registration page; No duplicate account is created',
  },
  'should navigate to login page': {
    description: 'User should be able to navigate from registration page to login page by clicking Sign In link',
    precondition: 'User is on the registration page; Sign In link/button is visible',
    postcondition: 'User is redirected to login page; URL contains "/login"; Login form is displayed',
  },
};

// Login UI Tests Metadata
export const loginTestCases: Record<string, TestCaseMetadata> = {
  'should successfully login with valid credentials': {
    description: 'User should be able to login using valid email and password and be redirected to home page',
    precondition: 'User is on the login page; Valid user account exists; User enters correct email and password; Frontend is accessible',
    postcondition: 'Login form is submitted; User is redirected to home page; User is marked as logged in; Session is established',
  },
  'should display error message with invalid credentials': {
    description: 'Login form should display error message when user submits invalid credentials',
    precondition: 'User is on the login page; Invalid email and/or password are entered; Login button is clicked',
    postcondition: 'Form submission fails; Error message is displayed indicating invalid credentials; User remains on login page; No session is created',
  },
  'should display error message when email is empty': {
    description: 'Login form should display validation error when email field is empty and form is submitted',
    precondition: 'User is on the login page; Email field is empty; Password field contains valid password; Login button is clicked',
    postcondition: 'Form validation fails; Error message "Email is required" is displayed; Form is not submitted; User remains on login page',
  },
  'should display error message when password is empty': {
    description: 'Login form should display validation error when password field is empty and form is submitted',
    precondition: 'User is on the login page; Email field contains valid email; Password field is empty; Login button is clicked',
    postcondition: 'Form validation fails; Error message "Password is required" is displayed; Form is not submitted; User remains on login page',
  },
  'should navigate to signup page': {
    description: 'User should be able to navigate from login page to registration page by clicking Sign Up link',
    precondition: 'User is on the login page; Sign Up link/button is visible',
    postcondition: 'User is redirected to registration page; URL contains "/register"; Registration form is displayed',
  },
  'should clear input fields': {
    description: 'User should be able to clear input field values using clear functionality',
    precondition: 'User is on the login page; Email and password fields have values entered',
    postcondition: 'Both email and password fields are empty after clearing; Fields are ready for new input; Form state is reset',
  },
  'should display loading text on submit button while signing in': {
    description: 'Login button should display loading state/text during the authentication process',
    precondition: 'User is on the login page; Valid credentials are entered; Login button is clicked; Authentication is in progress',
    postcondition: 'Sign In button displays loading text/spinner; Button is disabled during request; User cannot submit form again; Loading state persists until response arrives',
  },
  'should display page title and form elements': {
    description: 'Login page should display all required UI elements including title, email field, password field, and sign up link',
    precondition: 'User navigates to login page; Page is fully loaded',
    postcondition: 'Page title is visible; Email input field is visible and interactable; Password input field is visible and interactable; Sign Up link is visible',
  },
};

// Logout UI Tests Metadata
export const logoutTestCases: Record<string, TestCaseMetadata> = {
  'should successfully logout and redirect to login page': {
    description: 'User should be able to logout and be redirected to the login page',
    precondition: 'User is logged in and on the home page; Logout button/link is visible and accessible',
    postcondition: 'Logout is executed; User is redirected to login page; URL contains "/login"; User session is terminated; Auth token is cleared',
  },
  'should handle logout button loading state': {
    description: 'Logout button should display loading state during the logout process',
    precondition: 'User is logged in and on the home page; Logout button is clicked; Logout request is in progress',
    postcondition: 'Logout button displays loading state/spinner; Button is disabled during logout; User is redirected to login page after completion',
  },
  'should prevent access to protected routes after logout': {
    description: 'User should not be able to access protected routes after logging out',
    precondition: 'User is logged in; User logs out and is redirected to login page; User attempts to access protected routes',
    postcondition: 'Access to protected routes is denied; User is redirected to login page; Session remains terminated; No unauthorized access is granted',
  },
};

// Combined export for all UI tests
export const uiTestCases: Record<string, TestCaseMetadata> = {
  ...registrationTestCases,
  ...loginTestCases,
  ...logoutTestCases,
};
