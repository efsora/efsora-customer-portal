# Environment Variable Setup Guide

## Overview

This project uses a **single `.env` file** at the project root for all Docker services. This approach ensures:

- Single source of truth for all configuration
- No duplication of environment variables
- Easy to manage and update
- Consistent across all services

## Quick Start

1. **Copy the example file**:

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and fill in your values**:

   ```bash
   code .env
   ```

3. **Required changes** (minimum to get started):
   - `JWT_SECRET`: Generate with `openssl rand -base64 32`
   - `AWS_ACCESS_KEY_ID`: Your AWS access key for Bedrock
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `POSTGRES_PASSWORD`: Choose a secure password
   - `PGPASSWORD`: Should match backend user password

4. **Start services**:

   ```bash
   # Development mode (with hot reload) - RECOMMENDED
   make full-stack-up

   # Production mode (no hot reload)
   make full-stack-up-prod
   ```

## Environment Variable Structure

The `.env` file is organized into sections:

```
.env (root)
├── SHARED INFRASTRUCTURE
│   ├── PostgreSQL (POSTGRES_*)
│   └── Weaviate (WEAVIATE_*)
├── BACKEND SERVICE
│   ├── Server config (PORT, NODE_ENV)
│   ├── Database (DATABASE_URL)
│   ├── JWT (JWT_SECRET)
│   ├── Observability (OTEL_*, METRICS_*)
│   └── Logging (LOG_LEVEL, LOGGER_PRETTY)
├── FRONTEND SERVICE
│   ├── Build args (VITE_API_URL, VITE_NODE_ENV)
│   └── Server port (FRONTEND_PORT)
├── AI SERVICE
│   ├── Python app config (ENV, APP_NAME)
│   ├── Database schemas (AI_SCHEMA, BACKEND_SCHEMA)
│   ├── Weaviate config
│   ├── AI models (EMBED_MODEL, LLM_MODEL)
│   └── AWS Bedrock (AWS_*, BEDROCK_REGION)
└── TEST ENVIRONMENT
    ├── Cypress config (CYPRESS_*)
    ├── Test users (TEST_USER_*)
    └── Qase.io integration (QASE_*)
```

## Service-Specific Notes

### Backend (Express + TypeScript)

The backend validates all environment variables on startup using Zod. If validation fails, the service will not start and will log the error.

**Required variables**:

- `DATABASE_URL` (validated as URL)
- `JWT_SECRET` (min 32 characters)
- `OTEL_SERVICE_NAME`

**Validated at**: `backend/src/infrastructure/config/env.ts`

### Frontend (React + Vite)

Frontend environment variables are **baked into the bundle at build time**.

**Important**:

- All frontend env vars must be prefixed with `VITE_`
- Changes require rebuild: `docker-compose up -d --build frontend`
- For development mode (hot reload), changes take effect immediately

**Available in code**: `import.meta.env.VITE_*`

### AI Service (FastAPI + Python)

Uses Pydantic Settings for automatic validation and type checking.

**Required variables**:

- `AWS_ACCESS_KEY_ID` (for Bedrock access)
- `AWS_SECRET_ACCESS_KEY` (for Bedrock access)
- Database connection variables

**Validated at**: `ai-service/src/app/core/settings.py`

## Generating Secure Secrets

### JWT Secret (Backend)

Generate a secure random string (minimum 32 characters):

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output to `JWT_SECRET` in `.env`.

### Database Passwords

For production, use strong passwords:

```bash
# Generate 20-character alphanumeric password
openssl rand -base64 15
```

## Environment-Specific Configuration

For different environments (dev/staging/prod), you can:

### Option 1: Multiple .env files (Recommended)

```bash
.env.dev         # Development configuration
.env.staging     # Staging configuration
.env.prod        # Production configuration
```

Use with:

```bash
docker-compose --env-file .env.dev up -d
```

### Option 2: Override files

Create environment-specific compose files:

```bash
docker-compose.yml           # Base configuration
docker-compose.dev.yml       # Development overrides
docker-compose.staging.yml   # Staging overrides
docker-compose.prod.yml      # Production overrides
```

Use with:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Troubleshooting

### Service won't start

1. Check if `.env` file exists:

   ```bash
   ls -la .env
   ```

2. Check if required variables are set:

   ```bash
   grep "JWT_SECRET" .env
   grep "AWS_ACCESS_KEY_ID" .env
   ```

3. View service logs:

   ```bash
   make full-stack-logs-backend
   make full-stack-logs-ai
   make full-stack-logs-frontend

   # Or view all logs
   make full-stack-logs
   ```

### Variables not being loaded

1. Ensure no quotes around values in `.env`:

   ```bash
   # ❌ Wrong
   JWT_SECRET="my-secret"

   # ✅ Correct
   JWT_SECRET=my-secret
   ```

2. Restart services after changing `.env`:

   ```bash
   make full-stack-down
   make full-stack-up
   ```

3. For frontend changes, rebuild:
   ```bash
   make full-stack-rebuild
   # Or rebuild just frontend
   docker-compose up -d --build frontend
   ```

### Environment variable not found

Check if the variable is defined in:

1. `.env` file at root
2. `docker-compose.yml` service environment section
3. Referenced with `${VAR}` syntax

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore` by default
2. **Use different secrets per environment** - Don't reuse dev secrets in prod
3. **Rotate credentials regularly** - Especially AWS keys and JWT secrets
4. **Use strong passwords** - Minimum 16 characters for databases
5. **Limit AWS IAM permissions** - Only grant what's needed for Bedrock
6. **Use Docker secrets for production** - Consider Docker Swarm secrets or Kubernetes secrets

## AWS Credentials Setup

The AI service needs AWS credentials to access Amazon Bedrock.

### Create IAM User

1. Go to AWS IAM Console
2. Create new user: `efsora-bedrock-user`
3. Attach policy: `AmazonBedrockFullAccess` (or create custom policy)
4. Create access key
5. Copy `Access Key ID` and `Secret Access Key`

### Add to .env

```bash
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BEDROCK_REGION=us-east-1
```

### Custom IAM Policy (Least Privilege)

For production, use a restricted policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-sonnet-4-*"
      ]
    }
  ]
}
```

## Migration from Old Setup

If you have existing service-level `.env` files:

1. Consolidate all variables into root `.env`
2. Remove service-level `.env` files:
   ```bash
   rm backend/.env
   rm frontend/.env
   rm ai-service/.env
   ```
3. Keep only `.env.example` files for documentation
4. Restart Docker Compose

## Make Commands Reference

The project includes a comprehensive Makefile at the root. **Use these commands instead of direct Docker commands** for better developer experience:

### Quick Reference

```bash
# View all available commands
make help

# Start services (development mode with hot reload)
make full-stack-up

# Stop services
make full-stack-down

# View logs
make full-stack-logs

# Check status
make status

# Check health
make health
```

### Complete Command List

Run `make help` to see all commands organized by category:

- 🚀 Main Commands (starting/stopping services)
- 🧪 Testing (backend, AI service tests)
- 🔧 Type Generation (OpenAPI to TypeScript)
- 🗃️ Database (migrations, shell access)
- 🐚 Shell Access (container access)
- 📊 Status (service status and health)
- 🧹 Cleanup (remove artifacts and volumes)

## Questions?

If you encounter issues:

1. Check this guide first
2. Review `.env.example` for all available variables
3. Run `make help` to see all available commands
4. Check service-specific documentation in `*/CLAUDE.md`
5. Review logs with `make full-stack-logs`
