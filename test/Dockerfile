# Use official Cypress Docker image with Node.js and Cypress pre-installed
FROM cypress/included:13.17.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Use npm install if package-lock.json doesn't exist, otherwise use npm ci
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the application
COPY . .

# Create directories for test artifacts (if they don't exist)
RUN mkdir -p cypress/videos cypress/screenshots cypress/reports

# Set permissions
RUN chmod -R 777 cypress/videos cypress/screenshots cypress/reports

# Set environment variables
ENV CI=true
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress

# Expose port if needed for debugging
EXPOSE 3000

# Default command to run tests
CMD ["npm", "test"]

# Alternative: Use this to run in headed mode for debugging
# CMD ["npm", "run", "test:headed"]

# Alternative: Use this to open Cypress
# CMD ["npm", "run", "cypress:open"]
