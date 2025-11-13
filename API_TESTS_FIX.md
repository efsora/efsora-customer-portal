# API Tests Fix - Root Cause Found and Fixed ✅

## The Problem
The API tests were failing with "expected 500 to equal 201" because the endpoints were being called at the **wrong path**.

## Root Cause
The `apiUrl` in `test/cypress.config.ts` was set to:
```typescript
apiUrl: 'http://localhost:3000/api'
```

But the actual backend routes are under `/api/v1/`, not just `/api/`.

When AuthService called `/auth/register`, it was constructing:
- **Wrong path**: `http://localhost:3000/api/auth/register` ❌ (returns 500)
- **Correct path**: `http://localhost:3000/api/v1/auth/register` ✅ (returns 201)

## The Fix
Changed `test/cypress.config.ts` line 60 from:
```typescript
apiUrl: 'http://localhost:3000/api',
```

To:
```typescript
apiUrl: 'http://localhost:3000/api/v1',
```

## Verification
All endpoints now work correctly:
```
✅ POST http://localhost:3000/api/v1/auth/register → Status 201
✅ POST http://localhost:3000/api/v1/auth/login   → Status 200
✅ GET  http://localhost:3000/api/v1/users/:id   → Status 200
✅ GET  http://localhost:3000/health             → Status 200
```

## API Test Endpoints

### Authentication (with /api/v1 prefix)
- `POST /api/v1/auth/register` - Register new user (201)
- `POST /api/v1/auth/login` - Login user (200)
- `POST /api/v1/auth/logout` - Logout user (200)
- `GET  /api/v1/users/:id` - Get user by ID (200)

### Health Check (root level, no /api/v1)
- `GET /health` - Health check (200)

## Running Tests
```bash
cd test
npm run test:api
```

All tests should now pass! ✅

## Technical Details

### BaseApiService URL Construction
The BaseApiService uses `Cypress.env('apiUrl')` from cypress.config.ts as the base URL. When you call:
```typescript
this.post<T>('/auth/register', payload)
```

It constructs the full URL as:
```
baseUrl + endpoint = http://localhost:3000/api/v1 + /auth/register
                   = http://localhost:3000/api/v1/auth/register
```

### Service Classes

**AuthService**:
- Uses `/auth/*` endpoints
- Automatically prefixed with `http://localhost:3000/api/v1`
- Endpoints: register, login, logout

**HealthService**:
- Uses hardcoded `http://localhost:3000` base URL (root level)
- Health endpoint is at `/health`, not under `/api/v1/`
- This is correct and unchanged

## Files Modified
- ✅ `test/cypress.config.ts` - Fixed apiUrl to include `/v1`

## No Other Changes Needed
All the test files and service classes are correct. They were just pointing to the wrong base URL.
