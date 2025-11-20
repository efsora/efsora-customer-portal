# ==============================================================================
# Full-Stack Template Makefile
# ==============================================================================
# Main commands for managing the full-stack application

.PHONY: help full-stack-up full-stack-up-prod full-stack-down full-stack-logs full-stack-clean full-stack-restart full-stack-rebuild
.PHONY: install-backend install-frontend install-ai install-all
.PHONY: backend-test ai-test frontend-test backend-test-coverage ai-test-coverage test-all
.PHONY: e2e-test e2e-test-api e2e-test-spec e2e-test-local e2e-test-open e2e-test-rebuild
.PHONY: full-stack-up-with-tests full-stack-down-with-tests
.PHONY: generate-backend-types generate-ai-types generate-all-types
.PHONY: backend-shell ai-shell frontend-shell cypress-shell postgres-shell
.PHONY: db-migrate-backend db-migrate-ai db-migrate-all db-shell-backend db-shell-main
.PHONY: status health clean-node-modules clean-build clean-all

# ==============================================================================
# Help
# ==============================================================================

help: ## Show this help message
	@echo "╔══════════════════════════════════════════════════════════════════════════╗"
	@echo "║              Full-Stack Template - Available Commands                    ║"
	@echo "╚══════════════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🚀 Main Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "📝 Example Usage:"
	@echo "  make full-stack-up          # Start all services"
	@echo "  make backend-test           # Run backend tests"
	@echo "  make generate-backend-types # Generate frontend types from backend"
	@echo ""

# ==============================================================================
# Docker Compose Commands
# ==============================================================================

full-stack-up: ## 🚀 Start all services in development mode (with hot reload)
	@echo "🚀 Starting full-stack application in development mode..."
	@echo "   - PostgreSQL (port 5432)"
	@echo "   - Weaviate (port 8080)"
	@echo "   - Backend (port 3000, debug: 9229)"
	@echo "   - Frontend (port 5174, hot reload enabled)"
	@echo "   - AI Service (port 8000, debug: 5678)"
	@echo ""
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
	@echo ""
	@echo "✅ All services started in development mode!"
	@echo ""
	@echo "📍 Access points:"
	@echo "   Frontend:         http://localhost:5174"
	@echo "   Backend API:      http://localhost:3000"
	@echo "   Backend Swagger:  http://localhost:3000/swagger"
	@echo "   AI Service:       http://localhost:8000"
	@echo "   AI Service Docs:  http://localhost:8000/docs"
	@echo "   Weaviate:         http://localhost:8080"
	@echo ""
	@echo "🔥 Hot reload enabled - code changes will reflect automatically!"
	@echo "📊 View logs with: make full-stack-logs"
	@echo "🛑 Stop services with: make full-stack-down"

full-stack-up-prod: ## 🚀 Start all services in production mode (baked code, no hot reload)
	@echo "🚀 Starting full-stack application in production mode..."
	@echo "   - PostgreSQL (port 5432)"
	@echo "   - Weaviate (port 8080)"
	@echo "   - Backend (port 3000)"
	@echo "   - Frontend (port 5173)"
	@echo "   - AI Service (port 8000)"
	@echo ""
	docker compose up -d --build
	@echo ""
	@echo "✅ All services started in production mode!"
	@echo ""
	@echo "📍 Access points:"
	@echo "   Frontend:         http://localhost:5173"
	@echo "   Backend API:      http://localhost:3000"
	@echo "   Backend Swagger:  http://localhost:3000/swagger"
	@echo "   AI Service:       http://localhost:8000"
	@echo "   AI Service Docs:  http://localhost:8000/docs"
	@echo "   Weaviate:         http://localhost:8080"
	@echo ""
	@echo "⚠️  Production mode - code changes require rebuild!"
	@echo "📊 View logs with: make full-stack-logs"
	@echo "🛑 Stop services with: make full-stack-down"

full-stack-down: ## 🛑 Stop all services
	@echo "🛑 Stopping all services..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down
	@echo "✅ All services stopped!"

full-stack-restart: ## 🔄 Restart all services (dev mode)
	@echo "🔄 Restarting all services..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml restart
	@echo "✅ All services restarted!"

full-stack-logs: ## 📊 View logs from all services
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

full-stack-logs-backend: ## 📊 View backend logs only
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend

full-stack-logs-frontend: ## 📊 View frontend logs only
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend

full-stack-logs-ai: ## 📊 View AI service logs only
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f ai-service

full-stack-clean: ## 🧹 Stop services and remove volumes (WARNING: deletes all data)
	@echo "⚠️  WARNING: This will delete all data in Docker volumes!"
	@echo "   Press Ctrl+C to cancel, or Enter to continue..."
	@read confirm
	@echo "🧹 Cleaning up..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
	@echo "✅ All services stopped and volumes removed!"

full-stack-rebuild: ## 🔨 Rebuild and restart all services (dev mode)
	@echo "🔨 Rebuilding all services..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build --force-recreate
	@echo "✅ All services rebuilt and restarted!"

full-stack-up-with-tests: ## 🚀 Start all services + test container (dev mode)
	@echo "🚀 Starting full-stack application with test container..."
	@echo "   - PostgreSQL (port 5432)"
	@echo "   - Weaviate (port 8080)"
	@echo "   - Backend (port 3000, debug: 9229)"
	@echo "   - Frontend (port 5174, hot reload enabled)"
	@echo "   - AI Service (port 8000, debug: 5678)"
	@echo "   - Cypress Test Container (ready for tests)"
	@echo ""
	docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml --profile testing up -d --build
	@echo ""
	@echo "✅ All services + test container started!"
	@echo ""
	@echo "🧪 Run tests with:"
	@echo "   make e2e-test           # Run all E2E tests"
	@echo "   make e2e-test-api       # Run API tests only"
	@echo "   make e2e-test-open      # Open Cypress UI"
	@echo ""
	@echo "🛑 Stop services with: make full-stack-down-with-tests"

full-stack-down-with-tests: ## 🛑 Stop all services including test container
	@echo "🛑 Stopping all services including test container..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml --profile testing down
	@echo "✅ All services stopped!"

# ==============================================================================
# Installation Commands (Dockerized Services)
# ==============================================================================

install-backend: ## 📦 Install backend dependencies in Docker container
	@echo "📦 Installing backend dependencies in Docker..."
	docker compose run --rm backend npm install
	@echo "✅ Backend dependencies installed!"

install-frontend: ## 📦 Install frontend dependencies in Docker container
	@echo "📦 Installing frontend dependencies in Docker..."
	docker compose run --rm frontend npm install
	@echo "✅ Frontend dependencies installed!"

install-ai: ## 📦 Install AI service dependencies in Docker container
	@echo "📦 Installing AI service dependencies in Docker..."
	docker compose run --rm ai-service uv sync
	@echo "✅ AI service dependencies installed!"

install-all: install-backend install-frontend install-ai ## 📦 Install all dependencies in Docker containers
	@echo "✅ All dependencies installed!"

# ==============================================================================
# Testing Commands
# ==============================================================================

backend-test: ## 🧪 Run backend tests in Docker
	@echo "🧪 Running backend tests..."
	@echo "   Starting PostgreSQL..."
	docker compose up -d postgres
	@echo "   Waiting for PostgreSQL to be ready..."
	@sleep 3
	@echo "   Running tests..."
	cd backend && npm run test:run
	@echo "✅ Backend tests completed!"

backend-test-coverage: ## 📊 Run backend tests with coverage report
	@echo "📊 Running backend tests with coverage..."
	@echo "   Starting PostgreSQL..."
	docker compose up -d postgres
	@echo "   Waiting for PostgreSQL to be ready..."
	@sleep 3
	@echo "   Running tests with coverage..."
	cd backend && npm run test:coverage
	@echo "✅ Backend tests with coverage completed!"
	@echo "   Coverage report: backend/coverage/index.html"

ai-test: ## 🧪 Run AI service tests in Docker
	@echo "🧪 Running AI service tests..."
	@echo "   Starting PostgreSQL..."
	docker compose up -d postgres
	@echo "   Waiting for PostgreSQL to be ready..."
	@sleep 3
	@echo "   Running tests..."
	cd ai-service && make test
	@echo "✅ AI service tests completed!"

ai-test-coverage: ## 📊 Run AI service tests with coverage
	@echo "📊 Running AI service tests with coverage..."
	@echo "   Starting PostgreSQL..."
	docker compose up -d postgres
	@echo "   Waiting for PostgreSQL to be ready..."
	@sleep 3
	@echo "   Running tests with coverage..."
	cd ai-service && make test-cov
	@echo "✅ AI service tests with coverage completed!"

test-all: backend-test ai-test ## 🧪 Run all tests (backend + AI service)

# ==============================================================================
# E2E Testing Commands (Cypress in Docker)
# ==============================================================================

e2e-test: ## 🧪 Run all E2E tests in Docker (headless)
	@echo "🧪 Running E2E tests in Docker..."
	@echo "   Ensuring services are running..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml ps postgres backend frontend ai-service > /dev/null 2>&1 || \
		(echo "⚠️  Services not running. Starting them now..." && make full-stack-up)
	@echo "   Building test container..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml build cypress-tests
	@echo "   Running Cypress tests..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml run --rm cypress-tests npm run cypress:run
	@echo "✅ E2E tests completed!"
	@echo "   Videos: test/cypress/videos/"
	@echo "   Screenshots: test/cypress/screenshots/"

e2e-test-api: ## 🧪 Run API tests only in Docker
	@echo "🧪 Running API tests in Docker..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml run --rm cypress-tests npm run test:api
	@echo "✅ API tests completed!"

e2e-test-spec: ## 🧪 Run a specific test spec (usage: make e2e-test-spec SPEC="cypress/e2e/example.cy.ts")
	@if [ -z "$(SPEC)" ]; then \
		echo "❌ Please specify a spec file: make e2e-test-spec SPEC='cypress/e2e/example.cy.ts'"; \
		exit 1; \
	fi
	@echo "🧪 Running specific test: $(SPEC)"
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml run --rm cypress-tests npm run test:spec -- "$(SPEC)"
	@echo "✅ Test spec completed!"

e2e-test-local: ## 🧪 Run tests locally (not in Docker) - services must be running
	@echo "🧪 Running E2E tests locally..."
	@echo "   Ensuring services are running..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml ps postgres backend frontend ai-service > /dev/null 2>&1 || \
		(echo "⚠️  Services not running. Starting them now..." && make full-stack-up)
	@echo "   Running Cypress tests locally..."
	cd test && npm run cypress:run
	@echo "✅ E2E tests completed!"

e2e-test-open: ## 🧪 Open Cypress UI locally (not in Docker)
	@echo "🧪 Opening Cypress UI locally..."
	@echo "   Ensuring services are running..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml ps postgres backend frontend ai-service > /dev/null 2>&1 || \
		(echo "⚠️  Services not running. Starting them now..." && make full-stack-up)
	@echo "   Opening Cypress UI..."
	cd test && npm run cypress:open

e2e-test-rebuild: ## 🔨 Rebuild test container (after dependency changes)
	@echo "🔨 Rebuilding test container..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml build --no-cache cypress-tests
	@echo "✅ Test container rebuilt!"

# ==============================================================================
# Type Generation Commands
# ==============================================================================

generate-backend-types: ## 🔧 Generate frontend types from backend OpenAPI spec
	@echo "🔧 Generating frontend types from backend OpenAPI..."
	@echo "   Step 1: Generating backend OpenAPI spec..."
	cd backend && npm run generate:openapi
	@echo "   Step 2: Generating frontend TypeScript types..."
	cd frontend && npm run generate:types
	@echo "✅ Frontend types generated successfully!"
	@echo "   Location: frontend/schema.d.ts"

generate-ai-types: ## 🔧 Generate backend types from AI service OpenAPI spec
	@echo "🔧 Generating backend types from AI service OpenAPI..."
	@echo "   Starting AI service to expose OpenAPI spec..."
	docker compose up -d ai-service
	@echo "   Waiting for AI service to be ready..."
	@sleep 5
	@echo "   Generating TypeScript types from AI service OpenAPI..."
	mkdir -p backend/src/generated
	cd backend && npx openapi-typescript http://localhost:8000/openapi.json --output src/generated/ai-service.d.ts
	@echo "✅ Backend types from AI service generated successfully!"
	@echo "   Location: backend/src/generated/ai-service.d.ts"

generate-all-types: generate-backend-types generate-ai-types ## 🔧 Generate all types (frontend from backend, backend from AI)

# ==============================================================================
# Database Migration Commands
# ==============================================================================

db-migrate-backend: ## 🗃️  Run backend database migrations
	@echo "🗃️  Running backend database migrations..."
	docker compose up -d backend
	@echo "   Waiting for backend container..."
	@sleep 2
	docker compose exec backend sh -c "make db-migrate"
	@echo "✅ Backend migrations completed!"

db-migrate-ai: ## 🗃️  Run AI service database migrations
	@echo "🗃️  Running AI service database migrations..."
	docker compose up -d ai-service
	@echo "   Waiting for AI service container..."
	@sleep 2
	docker compose exec ai-service make migrate
	@echo "✅ AI service migrations completed!"

db-migrate-all: db-migrate-backend db-migrate-ai ## 🗃️  Run all database migrations

# ==============================================================================
# Database Utility Commands
# ==============================================================================

db-shell-backend: ## 🐚 Open backend database shell (backend_db)
	@echo "🐚 Opening backend database shell..."
	@echo "   Database: backend_db"
	@echo "   User: backend_user"
	@echo ""
	docker compose exec postgres psql -U backend_user -d backend_db

db-shell-main: ## 🐚 Open main database shell (app_db)
	@echo "🐚 Opening main database shell..."
	@echo "   Database: app_db"
	@echo "   User: postgres"
	@echo ""
	docker compose exec postgres psql -U postgres -d app_db

# ==============================================================================
# Development Shell Access
# ==============================================================================

backend-shell: ## 🐚 Open shell in backend container
	docker compose exec backend sh

ai-shell: ## 🐚 Open shell in AI service container
	docker compose exec ai-service bash

frontend-shell: ## 🐚 Open shell in frontend container
	docker compose exec frontend sh

postgres-shell: ## 🐚 Open PostgreSQL shell
	docker compose exec postgres psql -U postgres -d app_db

cypress-shell: ## 🐚 Open shell in Cypress test container
	docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml run --rm cypress-tests sh

# ==============================================================================
# Status Commands
# ==============================================================================

status: ## 📊 Show status of all services
	@echo "📊 Service Status:"
	@docker compose ps

health: ## 🏥 Check health of all services
	@echo "🏥 Health Check:"
	@echo ""
	@echo "Backend:"
	@curl -s http://localhost:3000/health | python3 -m json.tool || echo "❌ Backend not responding"
	@echo ""
	@echo "AI Service:"
	@curl -s http://localhost:8000/health | python3 -m json.tool || echo "❌ AI Service not responding"
	@echo ""
	@echo "Weaviate:"
	@curl -s http://localhost:8080/v1/.well-known/ready || echo "❌ Weaviate not responding"

# ==============================================================================
# Cleanup Commands
# ==============================================================================

clean-node-modules: ## 🧹 Remove all node_modules directories
	@echo "🧹 Removing node_modules..."
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	@echo "✅ All node_modules removed!"

clean-build: ## 🧹 Remove all build artifacts
	@echo "🧹 Removing build artifacts..."
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf backend/_docs/openapi.json
	rm -rf backend/src/generated
	@echo "✅ Build artifacts removed!"

clean-all: clean-node-modules clean-build full-stack-clean ## 🧹 Deep clean (removes everything)

# ==============================================================================
# Installation Commands
# ==============================================================================

install-backend: ## 📦 Install backend dependencies
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "✅ Backend dependencies installed!"

install-frontend: ## 📦 Install frontend dependencies
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Frontend dependencies installed!"

install-ai: ## 📦 Install AI service dependencies
	@echo "📦 Installing AI service dependencies..."
	cd ai-service && uv sync
	@echo "✅ AI service dependencies installed!"

install-all: install-backend install-frontend install-ai ## 📦 Install all dependencies

# ==============================================================================
# Default target
# ==============================================================================

.DEFAULT_GOAL := help
