# 🚀 Environment Setup - Quick Start

> **New team member?** This is all you need to get started.

## 1️⃣ Create Your Environment File

```bash
# Copy the template
cp .env.example .env
```

## 2️⃣ Generate Secure Secrets

```bash
# Generate JWT secret (required)
openssl rand -base64 32

# Copy the output and paste it in .env as JWT_SECRET
```

## 3️⃣ Edit Your `.env` File

Open `.env` and replace these minimum required values:

```bash
# REQUIRED: Change this!
JWT_SECRET=<paste-the-generated-secret-from-step-2>

# REQUIRED if using AI service: Add your AWS credentials
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>

# Optional: Change database password (default: postgres)
POSTGRES_PASSWORD=postgres
PGPASSWORD=backend_password
```

## 4️⃣ Start Services

```bash
# Start all services with hot reload (recommended for development)
make full-stack-up
```

## 5️⃣ Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5174 | React app with Vite |
| **Backend** | http://localhost:3000 | Express API |
| **AI Service** | http://localhost:8000 | FastAPI service |
| **API Docs** | http://localhost:3000/swagger | Swagger UI |
| **PostgreSQL** | localhost:5432 | Database |
| **Weaviate** | localhost:8080 | Vector DB |

## ✅ Verify Everything Works

```bash
# Check all services are running
make status

# Check health of all services
make health
```

## 🔧 Common Commands

### Starting & Stopping

```bash
# Start all services (dev mode with hot reload)
make full-stack-up

# Start in production mode (no hot reload)
make full-stack-up-prod

# Stop all services
make full-stack-down

# Restart all services
make full-stack-restart
```

### Viewing Logs

```bash
# View logs from all services
make full-stack-logs

# View logs for specific service
make full-stack-logs-backend
make full-stack-logs-frontend
make full-stack-logs-ai
```

### Rebuilding Services

```bash
# Rebuild and restart all services
make full-stack-rebuild

# Or rebuild specific service via docker-compose
docker-compose up -d --build backend
docker-compose up -d --build frontend
docker-compose up -d --build ai-service
```

### Installing Dependencies

```bash
# Install dependencies for all services (in Docker)
make install-all

# Or install for specific service
make install-backend
make install-frontend
make install-ai
```

### Database Operations

```bash
# Run backend migrations
make db-migrate-backend

# Run AI service migrations
make db-migrate-ai

# Run all migrations
make db-migrate-all

# Open database shell
make db-shell-backend    # Backend database
make db-shell-main       # Main app_db database
```

### Cleanup

```bash
# Stop and remove volumes (fresh start)
make full-stack-clean

# Deep clean (remove everything including node_modules)
make clean-all
```

## 🆘 Troubleshooting

### "Backend won't start"

**Check 1**: JWT_SECRET is set correctly (min 32 chars)
```bash
grep "JWT_SECRET" .env
```

**Check 2**: View backend logs
```bash
make full-stack-logs-backend
```

### "Frontend can't connect to backend"

**Check 1**: Backend is running
```bash
make status
```

**Check 2**: Check VITE_API_URL in .env
```bash
grep "VITE_API_URL" .env
# Should be: VITE_API_URL=http://localhost:3000
```

### "AI service errors"

**Check 1**: AWS credentials are set
```bash
grep "AWS_ACCESS_KEY_ID" .env
grep "AWS_SECRET_ACCESS_KEY" .env
```

**Check 2**: View AI service logs
```bash
make full-stack-logs-ai
```

## 📚 Available Make Commands

Run `make help` or `make` to see all available commands:

```bash
make help
```

You'll see organized categories:
- **🚀 Main Commands**: Starting/stopping services
- **🧪 Testing**: Run tests for each service
- **🔧 Type Generation**: Generate TypeScript types from OpenAPI specs
- **🗃️ Database**: Migrations and database management
- **🐚 Shell Access**: Access containers and databases
- **📊 Status**: Check service status and health
- **🧹 Cleanup**: Remove artifacts and volumes

## 📚 More Information

- **Detailed setup**: See [ENV_SETUP.md](ENV_SETUP.md)
- **What changed**: See [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
- **Service docs**: See `*/CLAUDE.md` in each service directory

## 🔐 Security Reminder

- ⚠️ **NEVER commit `.env` file** (it's gitignored)
- ✅ Only commit `.env.example` (template with no secrets)
- ✅ Generate unique secrets for each environment
- ✅ Rotate credentials regularly

---

**Need help?** Check the main project README or ask the team!
