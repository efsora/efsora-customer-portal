#!/usr/bin/env node

/**
 * Sync ALL Qase test metadata via Qase API
 * - Fetches ALL test cases from Qase
 * - Loads metadata from testCases.ts files
 * - Matches and updates all matching test cases
 */

const QASE_TOKEN = '07ee1ece4839a988cc9f89d11c44492a986eb512178d04462f31fc046c82ec11';
const PROJECT_CODE = 'ECP';
const BASE_URL = 'https://api.qase.io/v1';

interface TestCaseFromQase {
  id: number;
  title: string;
  description?: string;
  preconditions?: string;
  postconditions?: string;
}

interface LocalMetadata {
  [testName: string]: {
    description: string;
    precondition: string;
    postcondition: string;
  };
}

// All local test metadata
const localMetadata: LocalMetadata = {
  'should successfully register a new user': {
    description: 'User should be able to register with valid name, email, and password',
    precondition: 'Backend API is running; Database is accessible; No existing user with the same email',
    postcondition: 'User account is created; Authentication token is issued; User can be queried by ID',
  },
  'should return error when email already exists': {
    description: 'System should prevent duplicate email registration',
    precondition: 'Backend API is running; First user is successfully registered with unique email',
    postcondition: 'Second registration attempt fails with 409 Conflict; Original user account remains unchanged',
  },
  'should return error when name is missing': {
    description: 'Registration should fail when name field is empty',
    precondition: 'Backend API is running; Empty name value is provided',
    postcondition: 'Request fails with 400 Bad Request; No user account is created',
  },
  'should return error when email is missing': {
    description: 'Registration should fail when email field is empty',
    precondition: 'Backend API is running; Empty email value is provided',
    postcondition: 'Request fails with 400 Bad Request; No user account is created',
  },
  'should return error when password is missing': {
    description: 'Registration should fail when password field is empty',
    precondition: 'Backend API is running; Empty password value is provided',
    postcondition: 'Request fails with 400 Bad Request; No user account is created',
  },
  'should return error for invalid email format': {
    description: 'Registration should fail when email format is invalid',
    precondition: 'Backend API is running; Invalid email format is provided (e.g., "invalid-email-format")',
    postcondition: 'Request fails with 400 Bad Request; No user account is created',
  },
  'should return token in registration response': {
    description: 'JWT token should be issued after successful registration',
    precondition: 'Backend API is running; Valid registration data is provided',
    postcondition: 'Response includes valid JWT token; Token can be used for authenticated requests',
  },
  'should return user ID in registration response': {
    description: 'User ID should be included in successful registration response',
    precondition: 'Backend API is running; Valid registration data is provided',
    postcondition: 'Response includes valid user ID; User ID matches the created account',
  },
  'should successfully login with valid credentials': {
    description: 'User should be able to login with correct email and password',
    precondition: 'Backend API is running; User account exists with test credentials; Password matches stored password',
    postcondition: 'Login succeeds; JWT token is issued; User information is returned',
  },
  'should return error with invalid password': {
    description: 'Login should fail with incorrect password',
    precondition: 'Backend API is running; User account exists; Incorrect password is provided',
    postcondition: 'Login fails with 401 Unauthorized; No token is issued; User account remains locked out',
  },
  'should return error with non-existent email': {
    description: 'Login should fail when email does not exist in database',
    precondition: 'Backend API is running; Email address does not exist in database',
    postcondition: 'Login fails with 401 Unauthorized; No token is issued',
  },
  'should return token on successful login': {
    description: 'JWT token should be issued after successful login',
    precondition: 'Backend API is running; Valid login credentials are provided; User account exists',
    postcondition: 'Response includes valid JWT token; Token can be used for authenticated requests',
  },
  'should return user information on successful login': {
    description: 'User information should be included in successful login response',
    precondition: 'Backend API is running; Valid login credentials are provided; User account exists',
    postcondition: 'Response includes user ID, email, and name; Information matches user account',
  },
  'should respond within acceptable time': {
    description: 'Login endpoint should respond within 2 seconds',
    precondition: 'Backend API is running; Valid login credentials are provided; Network latency is normal',
    postcondition: 'Request completes within 2000ms; Response time is acceptable for user experience',
  },
  'should return user by ID with valid token': {
    description: 'User profile should be retrievable using valid authentication token',
    precondition: 'Backend API is running; Valid JWT token is provided; User account exists; User ID is valid',
    postcondition: 'Profile data is returned; User information matches created account; No sensitive data is exposed',
  },
  'should return 401 without authentication token': {
    description: 'Profile endpoint should reject requests without authentication token',
    precondition: 'Backend API is running; No authentication token is provided; User ID is valid',
    postcondition: 'Request fails with 401 Unauthorized; No user data is returned; User remains anonymous',
  },
  'should return 401 with invalid token': {
    description: 'Profile endpoint should reject requests with malformed or expired token',
    precondition: 'Backend API is running; Invalid/expired JWT token is provided; User ID is valid',
    postcondition: 'Request fails with 401 Unauthorized; No user data is returned',
  },
  'should return 404 for non-existent user': {
    description: 'Profile endpoint should return 404 when user ID does not exist',
    precondition: 'Backend API is running; Valid JWT token is provided; User ID is non-existent UUID',
    postcondition: 'Request fails with 404 Not Found; Error message indicates user not found',
  },
  'should complete full registration and get user flow': {
    description: 'Complete flow: register user, receive token, fetch profile using token',
    precondition: 'Backend API is running; Database is accessible; No user with test email exists',
    postcondition: 'User registered; Token issued and valid; User profile retrieved successfully; Flow completes without errors',
  },
  'should allow login with newly registered user': {
    description: 'Newly registered user should be able to login immediately',
    precondition: 'Backend API is running; User is successfully registered; Password is correct',
    postcondition: 'Login succeeds; Token is issued; User can access authenticated endpoints',
  },
  'should return healthy status': {
    description: 'Health endpoint should return healthy status when backend is running',
    precondition: 'Backend API is running and accessible',
    postcondition: 'Response status is 200 OK; Response includes status: "ok"; Response is properly formatted',
  },
  'should include timestamp in response': {
    description: 'Health response should include server timestamp',
    precondition: 'Backend API is running; Time sync is accurate',
    postcondition: 'Response includes timestamp field; Timestamp is valid ISO-8601 format; Timestamp reflects current time',
  },
  'should have proper response structure': {
    description: 'Health response should have correct structure with required fields',
    precondition: 'Backend API is running',
    postcondition: 'Response includes status, timestamp, and message fields; All fields have correct data types',
  },
  'should return consistent status': {
    description: 'Multiple health checks should return consistent status',
    precondition: 'Backend API is running; Server state is stable; Multiple requests are made in sequence',
    postcondition: 'All responses are identical; Status remains "ok" across multiple checks; No race conditions detected',
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
  'should successfully register with valid credentials': {
    description: 'User should be able to complete registration form with valid name, email, and password and be redirected after successful registration',
    precondition: 'User is on the registration page; Frontend is accessible; No user with the test email exists; All required form fields are empty',
    postcondition: 'Registration form is submitted; User is redirected to home/login page; Success response is received; User account is created in the system',
  },
};

async function getAllTestCases(): Promise<TestCaseFromQase[]> {
  console.log('📥 Fetching all test cases from Qase...');
  const allCases: TestCaseFromQase[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const url = `${BASE_URL}/case/${PROJECT_CODE}?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: { 'Token': QASE_TOKEN },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cases: HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const cases = data.result?.entities || [];

    if (cases.length === 0) break;

    allCases.push(...cases);
    offset += limit;
  }

  console.log(`✅ Fetched ${allCases.length} test cases from Qase\n`);
  return allCases;
}

async function updateTestCase(
  caseId: number,
  metadata: { description: string; precondition: string; postcondition: string }
) {
  const url = `${BASE_URL}/case/${PROJECT_CODE}/${caseId}`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Token': QASE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: metadata.description,
        preconditions: metadata.precondition,
        postconditions: metadata.postcondition,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function main() {
  console.log('🔄 Syncing ALL Qase test metadata via API...\n');

  // Fetch all test cases from Qase
  const qaseCases = await getAllTestCases();

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (const qaseCase of qaseCases) {
    const testName = qaseCase.title;
    const metadata = localMetadata[testName];

    if (!metadata) {
      process.stdout.write(`[${String(qaseCase.id).padStart(3)}] ${testName.substring(0, 40).padEnd(40)} ⊘ Skipped\n`);
      skipped++;
      continue;
    }

    process.stdout.write(`[${String(qaseCase.id).padStart(3)}] ${testName.substring(0, 40).padEnd(40)} Updating...`);

    const result = await updateTestCase(qaseCase.id, metadata);

    if (result.success) {
      console.log(' ✅');
      updated++;
    } else {
      console.log(` ❌ ${result.error}`);
      failed++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⊘ Skipped:  ${skipped}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`Total:      ${updated + skipped + failed}`);
}

main().catch(console.error);
