# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack monorepo with microservices architecture:
- **Frontend**: React + TypeScript + Vite (port 5173)
- **AI Service**: FastAPI + Python 3.11+ (port 8000)
- **Backend**: Express + TypeScript (planned, not yet implemented)
- **Test**: Cypress E2E/API tests with Page Object Model
- **Databases**: PostgreSQL (with separate schemas: `backend_schema`, `ai_schema`) and Weaviate (vector DB on port 8080)

## Architecture Principles

### Spec-First API Design
- API contracts are defined in `shared/contracts/` using OpenAPI 3.1
- `frontend-backend-api.yaml`: Frontend ↔ Backend contract
- `backend-ai-api.yaml`: Backend ↔ AI Service contract
- **Always update OpenAPI contracts before implementing API changes**
- Generate types after contract changes: `npm run generate:types`

### Database Schema Separation
- `backend_schema`: Backend has full access, AI service has read-only access
- `ai_schema`: AI service has full access, isolated from backend
- Each service manages its own migrations

### Communication Patterns
- Frontend ↔ Backend: HTTP + Server-Sent Events (SSE)
- Backend ↔ AI Service: HTTP + SSE

## Docker Development Setup

### Production vs Development Mode

**Production Mode** (`docker-compose.yml` only):
- Code is baked into Docker images at build time
- No hot reload - requires rebuild for code changes
- Uses nginx for frontend (static files)
- Suitable for production deployment

**Development Mode** (`docker-compose.yml` + `docker-compose.dev.yml`):
- Source code is mounted as volumes
- Hot reload enabled for all services
- Changes instantly reflect without rebuilding
- Frontend uses Vite dev server
- Backend uses Node.js watch mode
- AI service uses uvicorn --reload

**Test Mode** (`docker-compose.yml` + `docker-compose.dev.yml` + `docker-compose.test.yml`):
- Adds Cypress test container to the stack
- Test container only starts when explicitly requested (using `--profile testing` flag)
- Connects to the same network as other services
- Test code is mounted as volumes for quick iterations
- Test artifacts (videos, screenshots) are preserved locally

### Quick Start Development

```bash
# Start in development mode with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f [backend|frontend|ai-service]

# Stop services
docker-compose down
```

### Development Mode Features

**Frontend (Vite)**:
- Volume mount: `./frontend/src` → `/app/src`
- Port: 5174 (temporarily, will change to 5173)
- Hot Module Replacement (HMR) enabled
- Changes reflect instantly in browser

**Backend (Node.js + tsx)**:
- Volume mount: `./backend/src` → `/app/src`
- Port: 3000 (app), 9229 (debugger)
- Watch mode enabled via `--watch-path`
- Auto-restart on file changes

**AI Service (FastAPI + uvicorn)**:
- Volume mount: `./ai-service/src` → `/app/src`
- Port: 8000 (app), 5678 (debugpy)
- `--reload` flag enabled
- Auto-restart on file changes

### When to Rebuild

You only need to rebuild if you:
- Change `package.json` / `requirements.txt` (dependencies)
- Modify `Dockerfile` / `docker-compose.yml`
- Add new system packages

```bash
# Rebuild specific service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build [service-name]

# Rebuild all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

## Essential Commands

### Root Level (Monorepo)
```bash
# Install all dependencies
npm install

# Generate TypeScript/Python types from OpenAPI contracts
npm run generate:types

# Validate OpenAPI contracts
npm run lint:contracts

# Format OpenAPI contracts
npm run format:contracts

# Start infrastructure only
docker-compose up -d postgres weaviate

# Start all services (production mode - no hot reload)
docker-compose up -d

# Start all services (development mode - WITH HOT RELOAD)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Rebuild and start in dev mode (after dependency changes)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### AI Service (FastAPI)
```bash
cd ai-service

# Install dependencies with uv (preferred)
uv sync

# Run locally (with auto-reload)
make run
# Or: PYTHONPATH=src uvicorn app.main:app --app-dir src --reload

# Run in Docker dev mode
make run  # Uses docker-compose

# Run tests (in Docker, recommended)
make test

# Run tests with coverage
make test-cov

# Run migrations
uv run alembic upgrade head

# Create new migration
uv run alembic revision -m "description"

# Linting and formatting
make lint      # Ruff
make format    # Black
make type      # MyPy

# Run all quality checks (Black, Ruff, MyPy, Pyright, Bandit, pytest)
make pre-commit
```

### Frontend (React)
```bash
cd frontend

# Start dev server
make dev
# Or: npm run dev

# Build for production
make build

# Run linter
make lint

# Format code
make format

# Generate TypeScript types from OpenAPI
make generate-types

# Pre-commit checks (type-check, lint, format)
make commit-check

# Preview production build
make preview
```

### Test (Cypress)

**Using Makefile (Recommended):**
```bash
# Run E2E tests in Docker (headless)
make e2e-test

# Run API tests only in Docker
make e2e-test-api

# Run specific test spec in Docker
make e2e-test-spec SPEC="cypress/e2e/example.cy.ts"

# Run tests locally (not in Docker, faster for development)
make e2e-test-local

# Open Cypress UI locally
make e2e-test-open

# Start full-stack + test container (if you need the container to persist)
make full-stack-up-with-tests

# Rebuild test container (after dependency changes)
make e2e-test-rebuild
```

**Using npm directly (from test folder):**
```bash
cd test

# Open Cypress UI
npm run cypress:open

# Run all tests headless
npm run cypress:run

# Run E2E tests only
npm run test:e2e

# Run API tests only
npm run test:api

# Run in specific browser
npm run test:chrome
npm run test:firefox

# Lint and format
npm run lint
npm run lint:fix
npm run format
```

### Shared Contracts
```bash
cd shared

# Generate TypeScript types
npm run generate:ts-types

# Lint OpenAPI specs
npm run lint

# Format OpenAPI specs
npm run format
```

## AI Service Architecture

The AI service follows a layered architecture pattern:

- **`app/api/`**: FastAPI routers, request/response schemas, `AppResponse` envelope
- **`app/domain/`**: Pure business logic and domain models
- **`app/db_ops/`**: Database operations (async SQLAlchemy + asyncpg)
- **`app/infrastructure/`**: DB engine, SQLAlchemy models, utilities
- **`app/dependency_injection/`**: IoC container using `dependency-injector`
- **`app/core/`**: Settings (pydantic-settings), context, configuration
- **`src/migrations/`**: Alembic migration scripts

**Key Patterns:**
- Dependency injection via `Container` and `get_context()` for testability
- Async-first: All DB operations use async SQLAlchemy + asyncpg
- Response envelope: `AppResponse.ok()` / `AppResponse.fail()` for consistent API shape
- Trace IDs assigned per request for log correlation
- Tests enforce strict asyncio mode (`pytest-asyncio`)
- Database name automatically switches to `app_test` in test environment

## Frontend Architecture

- **`src/presentation/`**: UI layer
  - `components/`: Reusable React components
  - `pages/`: Page components composed from components
  - `view/`: Wrappers and providers
- **`src/hooks/`**: Custom React hooks (uses TanStack Query)
- **`src/api/`**: HTTP methods and API models (derived from `schema.d.ts`)
- **`src/locales/`**: i18n translations
  - `raw/translation.json`: Auto-generated from CSV (not committed)
  - `processed/translation.json`: Manually curated translations
- **State Management**: Zustand

**Environment Variables:**
1. Add to `.env` with `VITE_` prefix
2. Add to `ImportMetaEnv` interface in `env.d.ts`
3. Export from `env.ts` (conventionally without `VITE_` prefix)

## Test Architecture (Cypress)

- **Page Object Model (POM)** design pattern for E2E tests
- Separate test suites: `cypress/e2e/` for E2E, `cypress/e2e/api/` for API tests
- TypeScript throughout
- Multi-environment support (dev/staging/prod)
- Qase.io integration for test management

## Pre-commit Hooks

Husky is configured with lint-staged:
- **OpenAPI contracts**: Lint and format validation
- **Backend TypeScript**: Lint and type-check (when implemented)
- **Frontend**: Full commit-check via `make -C frontend -f Makefile commit-check`
- **AI Service Python**: Ruff, Black, MyPy validation
- **Packages**: Build check

## Development Workflow

1. **Define API Contract**: Update OpenAPI spec in `shared/contracts/`
2. **Generate Types**: Run `npm run generate:types` at root
3. **Implement Service**: Use generated types in service implementation
4. **Migrations**: Each service manages its own DB migrations
5. **Test**: Write tests following existing patterns
6. **Pre-commit**: Hooks run automatically or via `make pre-commit`

## Important Notes

- **Backend service is planned but not yet implemented** - Docker Compose has commented sections for it
- **Python dependency management**: Use `uv` (preferred) for AI service
- **Test database**: Automatically created as `app_test` in AI service tests
- **OpenAPI-generated files**: Never manually edit `schema.d.ts` or generated type files
- **AI Service test isolation**: Tests use dedicated `test_schema` with automatic setup/teardown
- **Frontend essential components**: Don't delete rightbar, leftbar, header, footer (empty them if needed)

## Running a Single Test

### AI Service (pytest)
```bash
cd ai-service
ENV=test DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/app_db PYTHONPATH=src pytest tests/path/to/test_file.py::test_function_name
```

### Cypress
```bash
cd test
npm run test:spec -- "cypress/e2e/path/to/spec.cy.ts"
```
