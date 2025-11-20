#!/bin/sh
set -e

echo "🔍 Waiting for database to be ready..."

# Wait for PostgreSQL to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

echo "🔄 Running database migrations..."

# Run migrations using Make command (migrate target for use inside Docker)
# Working directory is already /app from Dockerfile
make migrate 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully!"
else
  echo "❌ Migrations failed!"
  exit 1
fi

echo "🚀 Starting AI service..."

# Start the application
exec python -m uvicorn app.main:app --app-dir src --host 0.0.0.0 --port 8000 --reload
