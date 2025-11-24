/**
 * API Test Cases Metadata
 * Contains descriptions, preconditions, and postconditions for all API tests
 */

export interface TestCaseMetadata {
  description: string;
  precondition: string;
  postcondition: string;
}

// Authentication API Tests Metadata
export const authTestCases: Record<string, TestCaseMetadata> = {
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
};

// Health Check API Tests Metadata
export const healthTestCases: Record<string, TestCaseMetadata> = {
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
  'should respond within acceptable time': {
    description: 'Health endpoint should respond within 1 second',
    precondition: 'Backend API is running; Network latency is normal; No heavy load on server',
    postcondition: 'Request completes within 1000ms; Response time is acceptable for health checks',
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
};
