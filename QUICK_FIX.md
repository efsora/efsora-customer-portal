# Quick Fix for API Test 500 Errors

The 500 errors are caused by a **database initialization issue**. The init script didn't run when PostgreSQL started, so the `backend_user` and `backend_db` don't exist.

## ⚡ Fastest Fix (One Command)

```bash
./FIX_DATABASE.sh
```

This script will:
1. Stop all services
2. Remove the PostgreSQL volume (forces reinitialization)
3. Start PostgreSQL fresh with the init script
4. Start all other services
5. Test the registration endpoint
6. Confirm everything works

**Expected output:**
```
✅ Backend is ready
✅ Registration works! Tests should now pass
```

## 🔧 Manual Fix (If Script Doesn't Work)

### Step 1: Stop Everything
```bash
docker-compose down
```

### Step 2: Delete PostgreSQL Volume
```bash
# This removes the old database so the init script will run fresh
docker volume rm full-stack-postgres-data
```

### Step 3: Start Fresh
```bash
# Start in dev mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait ~30 seconds for services to initialize
sleep 30

# Check health
curl http://localhost:3000/health
```

### Step 4: Verify Database
```bash
# Should see backend_db in the list
docker-compose exec postgres psql -U postgres -l | grep backend_db
```

### Step 5: Test Registration
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }' | jq .
```

Should return `"success": true` with user and token.

## ▶️ Run Tests

Once fixed, run the tests:

```bash
cd test
npm run test:api
```

You should now see tests passing ✅

## 🔍 If Tests Still Fail

Check the backend logs for the actual error:

```bash
docker-compose logs backend | tail -50
```

Common remaining issues:

| Error | Fix |
|-------|-----|
| `Cannot find module` | Rebuild: `docker-compose build --no-cache backend` |
| `ECONNREFUSED postgres:5432` | Restart services: `docker-compose restart` |
| `relation "users" does not exist` | Run migrations: `docker-compose exec backend npm run db:migrate` |
| `SyntaxError in TypeScript` | Check TypeScript: `docker-compose exec backend npm run type-check` |

## 📋 Verify Setup

Run these commands to verify everything is working:

```bash
# 1. Check containers
docker-compose ps
# Should show: postgres, weaviate, backend, frontend, ai-service all "Up"

# 2. Check health endpoint
curl http://localhost:3000/health
# Should show: {"status":"ok","message":"Server is healthy",...}

# 3. Check database
docker-compose exec postgres psql -U postgres -d backend_db -c "SELECT COUNT(*) FROM users;"
# Should show: count = 0 (no users yet)

# 4. Check database user
docker-compose exec postgres psql -U postgres -c "SELECT usename FROM pg_user WHERE usename = 'backend_user';"
# Should show: backend_user
```

If all these pass ✅, your tests will work!

## 🆘 Need More Help?

If the above doesn't work, run the diagnostic guide:

```bash
cat DEBUGGING_500_ERRORS.md
```

Or collect diagnostic info:

```bash
docker-compose logs backend > backend_logs.txt 2>&1
docker-compose logs postgres > postgres_logs.txt 2>&1
docker-compose ps > containers_status.txt
echo "Share backend_logs.txt, postgres_logs.txt, and containers_status.txt for debugging"
```

## 🎯 Expected Final Result

After the fix, running API tests should show:

```bash
$ cd test && npm run test:api

  Health Check API Tests
    GET /health
      ✓ should return healthy status
      ✓ should include timestamp in response
      ✓ should respond within acceptable time
      ✓ should have proper response structure
      ✓ should return consistent status

  Authentication API Tests
    POST /auth/register
      ✓ should successfully register a new user
      ✓ should return error when email already exists
      ✓ ... (more tests)

    POST /auth/login
      ✓ should successfully login with valid credentials
      ✓ ... (more tests)

  25 passing (45s)
```

Happy testing! 🚀
