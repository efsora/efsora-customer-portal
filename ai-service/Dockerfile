# Dev image with hot reload + debugpy
FROM python:3.11-slim AS dev

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install PostgreSQL client for database wait script and Make
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl git postgresql-client make && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Copy requirements first
COPY requirements-dev.txt requirements.txt /app/

# 2) Copy project metadata & code BEFORE installing
COPY pyproject.toml README.md alembic.ini /app/
COPY src/ /app/src/
COPY tests/ /app/tests/
COPY Makefile /app/

# 3) Install dev deps
RUN pip install --upgrade pip && pip install -r /app/requirements-dev.txt

# Debugger (explicit)
RUN pip install debugpy

# Copy and set permissions for entrypoint script
COPY scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV PYTHONPATH=/app/src
EXPOSE 8000 5678

# Use the entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]
