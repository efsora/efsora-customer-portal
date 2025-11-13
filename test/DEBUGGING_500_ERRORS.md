# Debugging 500 Errors in API Tests

The 500 errors you're seeing mean the backend is experiencing an internal server error. Follow this guide to identify and fix the issue.

## Step 1: Verify Backend is Running

### Check if Backend is Accessible
```bash
# Test health endpoint
curl -v http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is healthy",
  "timestamp": "2025-11-12T18:00:00.000Z"
}
```

If this fails:
```bash
# Check if backend container is running
docker-compose ps

# Output should show backend as "Up"
# If not running, start it:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d backend
```

## Step 2: Check Backend Logs for Actual Error

```bash
# View backend logs
docker-compose logs -f backend
```

Look for error messages like:
- `DatabaseError`
- `ECONNREFUSED` (database connection failed)
- `table "users" does not exist`
- `function uuidv7() does not exist`
- `undefined is not a function`

Common errors and fixes below.

## Step 3: Database Connection Issues

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Cause:** PostgreSQL is not running

**Fix:**
```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Verify it's running
docker-compose ps postgres

# Should show "postgres    Up" with port 5432
```

### Error: "password authentication failed"

**Cause:** Wrong DATABASE_URL or PostgreSQL credentials

**Fix:**
```bash
# Check current DATABASE_URL in backend container
docker-compose exec backend env | grep DATABASE_URL

# Should be: postgresql://postgres:postgres@postgres:5432/app_db
```

### Error: "relation \"users\" does not exist"

**Cause:** Database migrations haven't run

**Fix:**
```bash
# Run database migrations
docker-compose exec backend npm run db:migrate

# Or manually:
docker-compose exec backend npx drizzle-kit migrate
```

### Error: "function uuidv7() does not exist"

**Cause:** PostgreSQL version doesn't support uuidv7 (needs 13.1+)

**Fix:**
```bash
# Check PostgreSQL version
docker-compose exec postgres psql -U postgres -c "SELECT version();"

# Should be 13.1 or higher
# If older, you need to update docker-compose.yml postgres image

# Alternative: Use uuid() instead of uuidv7()
# Modify backend/src/db/schema.ts
```

## Step 4: Complete Health Check

Run this full diagnostic:

```bash
#!/bin/bash
# Save as: diagnose.sh

echo "=== DOCKER CONTAINERS ==="
docker-compose ps

echo -e "\n=== BACKEND HEALTH ==="
curl -s http://localhost:3000/health | jq . || echo "❌ Backend not responding"

echo -e "\n=== DATABASE CONNECTION ==="
docker-compose exec postgres psql -U postgres -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "❌ Database query failed"

echo -e "\n=== BACKEND LOGS (Last 50 lines) ==="
docker-compose logs --tail=50 backend | tail -20

echo -e "\n=== DATABASE LOGS (Last 20 lines) ==="
docker-compose logs --tail=20 postgres

echo -e "\n=== ENVIRONMENT CHECK ==="
docker-compose exec backend env | grep -E "DATABASE_URL|NODE_ENV|PORT"
```

Run it:
```bash
chmod +x diagnose.sh
./diagnose.sh
```

## Step 5: Test Registration Manually

```bash
# Direct API call to register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }' | jq .
```

**Expected (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "test@example.com",
      "name": "Test User"
    },
    "token": "eyJhbGc..."
  },
  "traceId": "...",
  "error": null,
  "message": null,
  "meta": null
}
```

**If you get 500, the response will show the error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "The actual error message here"
  },
  ...
}
```

## Step 6: Common Solutions

### Solution 1: Full Reset

```bash
# Stop everything
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild and start fresh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Wait for services to initialize
sleep 10

# Run migrations
docker-compose exec backend npm run db:migrate

# Test health
curl http://localhost:3000/health
```

### Solution 2: Just Restart Backend

```bash
# Stop backend
docker-compose stop backend

# Remove container but keep volume
docker-compose rm backend

# Rebuild just backend
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build backend

# Test
curl http://localhost:3000/health
```

### Solution 3: Check Backend Code Syntax

```bash
# Validate TypeScript compilation
docker-compose exec backend npm run type-check

# Or rebuild
docker-compose build --no-cache backend
```

## Step 7: Enable Verbose Logging

Add to your test to see more details:

```typescript
// In cypress/e2e/api/auth.api.cy.ts
it('should successfully register a new user', () => {
  const newUser = {
    name: 'Register Test User',
    email: generateUniqueEmail('register-test'),
    password: 'TestPassword123!',
  };

  authService.register(newUser).then((response) => {
    // Log full response for debugging
    cy.log('Status: ' + response.status);
    cy.log('Body: ' + JSON.stringify(response.body, null, 2));

    if (response.status !== 201) {
      // Log error details
      cy.log('ERROR: ' + JSON.stringify(response.body.error, null, 2));
      throw new Error(`Expected 201 but got ${response.status}`);
    }

    authService.verifyRegistrationSuccess(response);
  });
});
```

Then run:
```bash
npm run cypress:open
# Select the test and run it
# Check Cypress console for detailed logs
```

## Step 8: If Error is in Application Code

Check backend logs for the actual error:

```bash
# Get full error stack
docker-compose logs backend 2>&1 | grep -A 20 "Error:"

# Or watch live
docker-compose logs -f backend
```

Common code errors:
- `Cannot read property 'X' of undefined` - Missing repository or initialization
- `Unexpected token in JSON` - Response parsing issue
- `Connection timeout` - Database slow or unreachable
- `Schema validation failed` - Input doesn't match Zod schema

## Step 9: Verify Database Schema

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d app_db

# Then run these SQL commands:
\dt                    -- List all tables
SELECT * FROM users;   -- Check users table
SELECT * FROM session; -- Check session table
\d users              -- Show users table structure
```

Expected output:
```
 id  | email | name | password | created_at | updated_at
-----+-------+------+----------+------------+------------
(0 rows) -- Empty is fine, no users created yet
```

## Step 10: Nuclear Option - Rebuild Everything

```bash
# Stop all services
docker-compose down -v

# Clean up volumes and old images
docker system prune -a

# Rebuild with fresh images
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Wait 15 seconds for initialization
sleep 15

# Check health
curl http://localhost:3000/health

# Run database migrations
docker-compose exec backend npm run db:migrate

# Verify database
docker-compose exec postgres psql -U postgres -d app_db -c "\dt"

# Test registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "manual-test@example.com",
    "password": "ManualTestPassword123!"
  }'
```

## Quick Checklist

- [ ] Backend container is running: `docker-compose ps backend`
- [ ] Health endpoint returns 200: `curl http://localhost:3000/health`
- [ ] PostgreSQL container is running: `docker-compose ps postgres`
- [ ] Database tables exist: `docker-compose exec postgres psql -U postgres -d app_db -c "\dt"`
- [ ] DATABASE_URL is set correctly in backend
- [ ] Backend logs show no errors: `docker-compose logs backend`
- [ ] Node_ENV is "development" (not production)
- [ ] Port 3000 is not in use by another service

## Support Info to Gather

If the above doesn't help, collect this info:

```bash
# Save all diagnostics to file
{
  echo "=== Docker Compose Version ==="
  docker-compose --version

  echo -e "\n=== Docker Containers Status ==="
  docker-compose ps

  echo -e "\n=== Backend Logs (Last 100 lines) ==="
  docker-compose logs --tail=100 backend

  echo -e "\n=== Database Logs (Last 50 lines) ==="
  docker-compose logs --tail=50 postgres

  echo -e "\n=== Backend Environment ==="
  docker-compose exec backend env | sort

  echo -e "\n=== Database Version ==="
  docker-compose exec postgres psql -U postgres -c "SELECT version();"

  echo -e "\n=== Database Tables ==="
  docker-compose exec postgres psql -U postgres -d app_db -c "\dt"

  echo -e "\n=== Test Registration ==="
  curl -v -X POST http://localhost:3000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Diagnostic Test",
      "email": "diagnostic@example.com",
      "password": "DiagnosticPassword123!"
    }'
} > backend_diagnostic.log 2>&1

cat backend_diagnostic.log
```

Share the `backend_diagnostic.log` output for detailed troubleshooting.
