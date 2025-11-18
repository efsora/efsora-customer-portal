# Default Node package manager command
NPM = npm

# ----------------------------------------
# Development
# ----------------------------------------
dev:
	$(NPM) run dev

preview:
	$(NPM) run preview

# ----------------------------------------
# Build & Generate
# ----------------------------------------
build:
	$(NPM) run build

generate-types:
	$(NPM) run generate:types

# ----------------------------------------
# Code quality
# ----------------------------------------
lint:
	$(NPM) run lint

format:
	$(NPM) run format

# ----------------------------------------
# Pre-commit / commit check
# ----------------------------------------
commit-check:
	@echo "Running pre-commit checks..."
	$(NPM) run type-check
	$(NPM) run lint
	$(NPM) run format:check
	@echo "All checks passed"

pre-commit:
	@echo "🔍 Running frontend pre-commit checks..."
	@$(NPM) run format:check || (echo "❌ Format check failed" && exit 1)
	@$(NPM) run lint || (echo "❌ Lint check failed" && exit 1)
	@$(NPM) run type-check || (echo "❌ Type check failed" && exit 1)
	@echo "✅ Frontend pre-commit checks passed"

# ----------------------------------------
# Docker commands
# ----------------------------------------
docker-dev:
	@echo "Starting frontend container in development mode..."
	docker-compose up

docker-dev-build:
	@echo "Building and starting frontend container..."
	docker-compose up --build

docker-dev-down:
	@echo "Stopping frontend container..."
	docker-compose down

docker-dev-logs:
	@echo "Showing frontend container logs..."
	docker-compose logs -f

# ----------------------------------------
# Shortcut for all
# ----------------------------------------
all: format lint build
	@echo "Format, lint and build completed."
