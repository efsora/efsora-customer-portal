# ---- Variables ----
PY = uv run
APP = app.main:app
APP_DIR = src
PYTHONPATH ?= $(APP_DIR)

# ---- Phony ----
.PHONY: install install-hooks-force run test test-cov test-migrations lint type check pre-commit-install pre-commit pre-commit-clean pre-commit-reinstall format ruff ruff-fix mypy bandit qa

# ---- Setup ----
install:
	@echo "Installing dependencies..."
	uv sync
	@echo ""
	@echo "Checking pre-commit hook setup..."
	@if git config --get core.hooksPath > /dev/null 2>&1; then \
		echo "⚠️  Git hooks are managed at repository level (core.hooksPath is set)"; \
		echo "   Skipping local pre-commit hook installation."; \
		echo "   To run checks manually, use: make pre-commit"; \
	else \
		echo "Installing pre-commit hooks..."; \
		$(PY) pre-commit install && echo "✓ Pre-commit hooks installed!"; \
	fi
	@echo ""
	@echo "✓ Installation complete!"

install-hooks-force:
	@echo "Force installing pre-commit hooks..."
	@echo "This will temporarily unset core.hooksPath for ai-service."
	git config --local --unset core.hooksPath || true
	$(PY) pre-commit install
	@echo "✓ Pre-commit hooks installed!"
	@echo "⚠️  Note: You may need to reconfigure hooks for the monorepo."

# ---- Development ----
run:
	uv sync --frozen
	uv run uvicorn $(APP) --reload --app-dir $(APP_DIR)

# ---- Tests ----
test:
	docker compose up -d postgres
	docker compose run --rm ai-service \
	  bash -lc 'ENV=test DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/app_db PYTHONPATH=/app/src pytest -q -s'


test-migrations:
	docker compose up -d postgres
	docker compose run --rm ai-service \
	  bash -lc 'ENV=test DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/app_db PYTHONPATH=/app/src alembic upgrade head'


test-cov:
	docker compose up -d postgres
	docker compose run --rm ai-service \
	  bash -lc 'ENV=test DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/app_db PYTHONPATH=/app/src \
	    coverage erase && coverage run -m pytest -q && coverage report && coverage html'

# ---- Quality ----
lint:
	$(PY) ruff check .

format:
	$(PY) black .

type:
	PYTHONPATH=$(PYTHONPATH) $(PY) mypy .

check: fmt lint type test-cov

# ---- Pre-commit ----
pre-commit-install:
	$(PY) pre-commit install

pre-commit:
	@echo "🔍 Running ai-service pre-commit checks..."
	@$(PY) black --check . || (echo "❌ Black format check failed" && exit 1)
	@$(PY) ruff check . || (echo "❌ Ruff lint check failed" && exit 1)
	@PYTHONPATH=$(PYTHONPATH) $(PY) mypy || (echo "❌ MyPy type check failed" && exit 1)
	@echo "✅ AI service pre-commit checks passed"

pre-commit-clean:
	@echo "🧹 Cleaning pre-commit cache..."
	$(PY) pre-commit clean
	$(PY) pre-commit gc
	@echo "✓ Pre-commit cache cleaned!"

pre-commit-reinstall:
	@echo "🔄 Reinstalling pre-commit environments..."
	$(PY) pre-commit clean
	$(PY) pre-commit gc
	$(PY) pre-commit install --install-hooks
	@echo "✓ Pre-commit environments reinstalled!"
	@echo ""
	@echo "💡 Now run: make pre-commit"

ruff:
	$(PY) ruff check --config pyproject.toml .

ruff-fix:
	$(PY) ruff check --config pyproject.toml --fix .

mypy:
	$(PY) mypy --config-file pyproject.toml .

bandit:
	$(PY) bandit -r src -c pyproject.toml
