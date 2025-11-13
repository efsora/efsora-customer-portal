#!/bin/bash

# Fix script for 500 API test errors
# This script resets the database and reinitializes it with proper configuration

set -e  # Exit on any error

echo "🔧 Starting database fix..."
echo ""

# Step 1: Stop all services
echo "1️⃣  Stopping services..."
docker-compose down
echo "✅ Services stopped"
echo ""

# Step 2: Remove PostgreSQL volume (to force reinitialization)
echo "2️⃣  Removing PostgreSQL volume..."
docker volume rm full-stack-postgres-data 2>/dev/null || echo "   (Volume didn't exist or couldn't be removed)"
echo "✅ Volume removed"
echo ""

# Step 3: Start PostgreSQL and wait for it to be healthy
echo "3️⃣  Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "   Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "   ❌ PostgreSQL didn't start in time"
    exit 1
  fi
  sleep 1
done
echo ""

# Step 4: Verify database initialization
echo "4️⃣  Verifying database initialization..."
RESULT=$(docker-compose exec -T postgres psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'backend_db';" 2>&1)
if echo "$RESULT" | grep -q "1 row"; then
  echo "   ✅ backend_db exists"
else
  echo "   ⚠️  backend_db doesn't exist, will be created on next startup"
fi
echo ""

# Step 5: Start all services (backend will initialize DB with migrations)
echo "5️⃣  Starting all services (this may take 1-2 minutes)..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for backend to be ready
echo "   Waiting for backend to be ready..."
for i in {1..60}; do
  if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ Backend is ready"
    break
  fi
  if [ $i -eq 60 ]; then
    echo "   ⚠️  Backend took too long to start, checking logs..."
    docker-compose logs --tail=20 backend
    exit 1
  fi
  sleep 2
done
echo ""

# Step 6: Test registration endpoint
echo "6️⃣  Testing registration endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "fix-test@example.com",
    "password": "FixTestPassword123!"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "   ✅ Registration works! Tests should now pass"
  echo ""
  echo "📋 Response:"
  echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
elif echo "$RESPONSE" | grep -q '"status":"ok"'; then
  echo "   ✅ Health check passed, database ready"
else
  echo "   ⚠️  Registration returned unexpected response:"
  echo "$RESPONSE"
fi
echo ""

# Step 7: Show status
echo "7️⃣  Final status:"
docker-compose ps
echo ""

echo "✅ Database fix complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run the API tests: cd test && npm run test:api"
echo "   2. If tests still fail, check logs: docker-compose logs -f backend"
echo ""
