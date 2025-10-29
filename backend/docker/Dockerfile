# Use Node.js 22 (matching .nvmrc)
FROM node:22

# Install PostgreSQL client for database wait script
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy root package files for workspace setup
COPY package*.json ./

# Copy backend package.json
COPY backend/package.json ./backend/

# Install dependencies using workspace (skip prepare scripts like husky)
RUN npm ci --workspace=backend --ignore-scripts

# Copy backend source code
COPY backend/ ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Copy and set permissions for entrypoint script
COPY backend/scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the application port
EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]