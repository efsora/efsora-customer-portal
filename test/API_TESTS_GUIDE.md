# API Tests Guide

## Overview

This guide explains the updated API tests for the Customer Portal backend. The tests are now aligned with your actual backend implementation.

## Test Files

### API Service Classes
- **[cypress/api/BaseApiService.ts](./cypress/api/BaseApiService.ts)** - Base class with common HTTP methods
- **[cypress/api/AuthService.ts](./cypress/api/AuthService.ts)** - Authentication API methods
- **[cypress/api/HealthService.ts](./cypress/api/HealthService.ts)** - Health check API methods

### Test Suites
- **[cypress/e2e/api/health.api.cy.ts](./cypress/e2e/api/health.api.cy.ts)** - Health check tests (5 tests)
- **[cypress/e2e/api/auth.api.cy.ts](./cypress/e2e/api/auth.api.cy.ts)** - Authentication tests (20+ tests)

## API Endpoints Tested

### Health Check
```
GET http://localhost:3000/health
```
**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Server is healthy",
  "timestamp": "2025-11-12T18:00:00.000Z"
}
```

### Authentication

#### POST /api/v1/auth/register
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token-here"
  },
  "traceId": "trace-id",
  "error": null,
  "message": null,
  "meta": null
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email format, password too short (<8 chars), missing fields
- `409 Conflict` - Email already exists

#### POST /api/v1/auth/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2025-11-12T17:00:00.000Z",
      "updatedAt": "2025-11-12T18:00:00.000Z"
    },
    "token": "jwt-token-here"
  },
  "traceId": "trace-id",
  "error": null,
  "message": null,
  "meta": null
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email format, missing fields
- `401 Unauthorized` - Invalid email or password

#### GET /api/v1/users/:id
**Headers:** `Authorization: Bearer <jwt-token>`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-12T17:00:00.000Z",
    "updatedAt": "2025-11-12T18:00:00.000Z"
  },
  "traceId": "trace-id",
  "error": null,
  "message": null,
  "meta": null
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User doesn't exist

## Running the Tests

### Prerequisites
1. Backend is running on `http://localhost:3000`
2. PostgreSQL database is configured and running
3. From test directory: `npm install` (if not already done)

### Run All API Tests
```bash
cd test
npm run test:api
```

### Run Health Tests Only
```bash
npm run test:spec -- "cypress/e2e/api/health.api.cy.ts"
```

### Run Auth Tests Only
```bash
npm run test:spec -- "cypress/e2e/api/auth.api.cy.ts"
```

### Open Cypress UI (Interactive Testing)
```bash
npm run cypress:open
```
Then select "E2E Testing" and choose the test file to run interactively.

## Common Issues & Fixes

### Issue: 500 Server Error

**Causes:**
1. Backend service not running
2. Database connection issue
3. Password validation error (minimum 8 characters required)
4. Missing required fields

**Fix:**
```bash
# Check if backend is running
curl http://localhost:3000/health

# If not running, start backend
# In root directory:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d backend

# Check logs
docker-compose logs -f backend
```

### Issue: Connection Refused

**Cause:** Backend not running on port 3000

**Fix:**
```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Or start backend only
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d backend
```

### Issue: 409 Conflict (Email Already Exists)

**Cause:** Test user was created in a previous run and not cleaned up

**Fix:**
1. Tests automatically use unique emails (via `generateUniqueEmail()`)
2. Each test run should generate new emails with timestamps
3. If issue persists, delete test users from database:
```sql
DELETE FROM users WHERE email LIKE 'testuser%' OR email LIKE 'api-test%';
```

### Issue: 401 Unauthorized on Protected Endpoints

**Causes:**
1. Token not sent in Authorization header
2. Invalid/expired token
3. User doesn't have permission for the resource

**Fix:**
```typescript
// Ensure token is set before authenticated requests
authService.setToken(response.body.data.token);

// Token is automatically included in Authorization header
```

### Issue: 400 Bad Request

**Check:**
- All required fields are provided: `name`, `email`, `password`
- Email is in valid format (contains @)
- Password is at least 8 characters long

**Example of invalid registration:**
```typescript
// ❌ WRONG - Missing name field
authService.register({
  email: 'user@example.com',
  password: 'password123'  // Also only 11 chars, might be too short
});

// ✅ CORRECT
authService.register({
  name: 'John Doe',
  email: 'user@example.com',
  password: 'SecurePassword123!'  // 21 chars, meets minimum 8 char requirement
});
```

## Test Data

### Password Requirements
- **Minimum length:** 8 characters
- **Example valid passwords:**
  - `TestPassword123!`
  - `SecurePass2025`
  - `MyP@ssw0rd`

### Email Format
- Must be valid email format (with @)
- Should be unique for each test run
- Tests use `generateUniqueEmail()` helper automatically

### User Information
- `name`: Required, minimum 1 character
- `email`: Required, valid email format, must be unique
- `password`: Required, minimum 8 characters

## Test Structure

### Health Check Tests (5 tests)
1. ✅ Returns healthy status
2. ✅ Includes timestamp in response
3. ✅ Responds within 1 second
4. ✅ Has proper response structure
5. ✅ Returns consistent status across calls

### Authentication Tests (20+ tests)

#### Registration (8 tests)
1. ✅ Successfully register a new user
2. ✅ Error when email already exists (409)
3. ✅ Error when required fields missing (400)
4. ✅ Error when name is missing (400)
5. ✅ Error when email is missing (400)
6. ✅ Error when password is missing (400)
7. ✅ Error for invalid email format (400)
8. ✅ Returns token in response
9. ✅ Returns user ID in response

#### Login (9 tests)
1. ✅ Successfully login with valid credentials
2. ✅ Error with invalid password (401)
3. ✅ Error with non-existent email (401)
4. ✅ Error when email is missing (400)
5. ✅ Error when password is missing (400)
6. ✅ Returns token on successful login
7. ✅ Returns user information
8. ✅ Email case-insensitivity test
9. ✅ Responds within 2 seconds

#### Get User by ID (4 tests)
1. ✅ Returns user by ID with valid token
2. ✅ Returns 401 without authentication
3. ✅ Returns 401 with invalid token
4. ✅ Returns 404 for non-existent user

#### Integration Tests (2 tests)
1. ✅ Complete registration and get profile flow
2. ✅ Register then login flow

## Key Implementation Details

### Authentication Flow
```
1. Register User
   ├─ POST /api/v1/auth/register
   ├─ Returns: { user, token }
   └─ Status: 201 Created

2. Login User
   ├─ POST /api/v1/auth/login
   ├─ Returns: { user, token }
   └─ Status: 200 OK

3. Get User Profile (Authenticated)
   ├─ GET /api/v1/users/:id
   ├─ Requires: Bearer token
   ├─ Returns: user data
   └─ Status: 200 OK
```

### Response Structure
All authenticated endpoints follow this structure:
```json
{
  "success": boolean,
  "data": T,  // Endpoint-specific data
  "traceId": string,  // Request correlation ID
  "error": null | { code, message },
  "message": null | string,
  "meta": null
}
```

### Error Handling
```typescript
// 400 Bad Request - Validation error
if (response.status === 400) {
  authService.verifyBadRequest(response);
}

// 401 Unauthorized - Invalid credentials or missing token
if (response.status === 401) {
  authService.verifyUnauthorized(response);
}

// 409 Conflict - Email already exists
if (response.status === 409) {
  authService.verifyConflict(response);
}

// 404 Not Found - User doesn't exist
if (response.status === 404) {
  authService.verifyStatus(response, 404);
}
```

## Debugging Tips

### Log Responses
```typescript
authService.logResponse(response, 'Debug Label');
```

### Check Response Status
```typescript
cy.log(`Response Status: ${response.status}`);
cy.log(`Response Body: ${JSON.stringify(response.body, null, 2)}`);
```

### Verify Request Headers
```typescript
// Headers are automatically set:
// - Content-Type: application/json
// - Authorization: Bearer <token> (when authenticated)
```

### Run Single Test
```bash
npm run test:spec -- "cypress/e2e/api/auth.api.cy.ts" --grep "should successfully register"
```

## Environment Configuration

### cypress.config.ts Settings
```typescript
env: {
  apiUrl: 'http://localhost:3000/api',  // Base URL for API endpoints
}
```

### Backend URLs
- **Health:** http://localhost:3000/health
- **API Base:** http://localhost:3000/api/v1

## Best Practices

1. **Always provide all required fields** when registering/logging in
2. **Use unique emails** - tests use `generateUniqueEmail()` automatically
3. **Password must be 8+ characters** - use `TestPassword123!` format
4. **Set token before authenticated requests** - use `authService.setToken(token)`
5. **Clean up tokens** - use `authService.clearToken()` when testing auth failures
6. **Check response structure** - use provided verification methods

## Additional Resources

- [OpenAPI Contract](../../shared/contracts/frontend-backend-api.yaml)
- [Backend Source](../../backend/src/routes/)
- [Cypress Documentation](https://docs.cypress.io/)
