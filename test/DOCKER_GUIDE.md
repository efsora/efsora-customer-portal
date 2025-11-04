# Docker Guide for Cypress Template

This guide explains how to run Cypress tests using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed (Docker Engine 20.10+ and Docker Compose V2)
- At least 4GB RAM allocated to Docker
- Basic understanding of Docker concepts

## Quick Start

### Run tests with Docker Compose

```bash
# Run tests
npm run docker:run

# Or directly with docker-compose
docker-compose up
```

### Run tests in detached mode

```bash
npm run docker:run:detached

# Or directly
docker-compose up -d
```

### View logs from detached containers

```bash
docker-compose logs -f cypress-tests
```

### Stop containers

```bash
npm run docker:down

# Or directly
docker-compose down
```

## Building the Docker Image

### Build the image

```bash
npm run docker:build

# Or directly
docker build -t cypress-template .
```

### Build with no cache (fresh build)

```bash
docker build --no-cache -t cypress-template .
```

## Running Tests in Docker

### Run all tests

```bash
docker-compose run --rm cypress-tests npm test
```

### Run specific test file

```bash
docker-compose run --rm cypress-tests npm run test:spec -- cypress/e2e/login.cy.ts
```

### Run E2E tests only

```bash
docker-compose run --rm cypress-tests npm run test:e2e
```

### Run API tests only

```bash
docker-compose run --rm cypress-tests npm run test:api
```

### Run tests for specific environment

```bash
# Development
docker-compose run --rm -e CYPRESS_environment=dev cypress-tests npm run test:dev

# Staging
docker-compose run --rm -e CYPRESS_environment=staging cypress-tests npm run test:staging

# Production
docker-compose run --rm -e CYPRESS_environment=prod cypress-tests npm run test:prod
```

## Environment Variables

### Setting environment variables

Create a `.env` file in the project root:

```bash
CYPRESS_baseUrl=http://localhost:3000
CYPRESS_apiUrl=http://localhost:3000/api
QASE_API_TOKEN=your_qase_token
QASE_PROJECT_CODE=your_project_code
```

### Pass environment variables at runtime

```bash
docker-compose run --rm \
  -e CYPRESS_baseUrl=https://example.com \
  -e CYPRESS_apiUrl=https://api.example.com \
  cypress-tests npm test
```

## Accessing Test Artifacts

Test artifacts (videos, screenshots, reports) are automatically saved to your host machine through volume mounts:

- Videos: `./cypress/videos/`
- Screenshots: `./cypress/screenshots/`
- Reports: `./cypress/reports/`

These directories are created automatically if they don't exist.

## Development Mode

### Run with live code updates

The docker-compose.yml is configured to mount your source code, so changes are reflected immediately:

```bash
# Start in detached mode
docker-compose up -d

# Make code changes
# Tests will use the updated code on next run

# Run tests again
docker-compose run --rm cypress-tests npm test
```

### Interactive mode (for debugging)

```bash
# Open a shell in the container
docker-compose run --rm cypress-tests /bin/bash

# Inside the container, you can run commands
npm test
npm run cypress:open  # Note: requires X11 forwarding for GUI
npm run lint
```

## Advanced Usage

### Run with custom command

```bash
docker-compose run --rm cypress-tests npm run test:chrome
```

### Run in headed mode (requires X11)

On Linux with X11:

```bash
docker-compose run --rm \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  cypress-tests npm run test:headed
```

### Parallel execution

```bash
# Run multiple containers in parallel
docker-compose up --scale cypress-tests=3
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Docker Cypress Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t cypress-template .

      - name: Run tests in Docker
        env:
          CYPRESS_baseUrl: ${{ secrets.BASE_URL }}
          QASE_API_TOKEN: ${{ secrets.QASE_API_TOKEN }}
          QASE_PROJECT_CODE: ${{ secrets.QASE_PROJECT_CODE }}
        run: |
          docker run --rm \
            -e CYPRESS_baseUrl=$CYPRESS_baseUrl \
            -e QASE_API_TOKEN=$QASE_API_TOKEN \
            -e QASE_PROJECT_CODE=$QASE_PROJECT_CODE \
            -v $PWD/cypress/videos:/app/cypress/videos \
            -v $PWD/cypress/screenshots:/app/cypress/screenshots \
            cypress-template

      - name: Upload test artifacts
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-artifacts
          path: |
            cypress/videos/
            cypress/screenshots/
            cypress/reports/
```

### GitLab CI

```yaml
docker-cypress-tests:
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker info
  script:
    - docker build -t cypress-template .
    - docker run --rm
      -e CYPRESS_baseUrl=$BASE_URL
      -e QASE_API_TOKEN=$QASE_API_TOKEN
      -e QASE_PROJECT_CODE=$QASE_PROJECT_CODE
      -v $PWD/cypress/videos:/app/cypress/videos
      -v $PWD/cypress/screenshots:/app/cypress/screenshots
      cypress-template
  artifacts:
    when: always
    paths:
      - cypress/videos/
      - cypress/screenshots/
      - cypress/reports/
    expire_in: 1 week
```

## Troubleshooting

### Permission Issues

If you encounter permission issues with mounted volumes:

```bash
# On Linux, run with your user ID
docker-compose run --rm --user $(id -u):$(id -g) cypress-tests npm test
```

### Out of Memory

If tests fail due to memory issues:

```bash
# Increase Docker memory limit in Docker Desktop settings
# Or limit Cypress resources
docker-compose run --rm \
  -e NODE_OPTIONS="--max-old-space-size=2048" \
  cypress-tests npm test
```

### Network Issues

If tests can't reach your application:

```bash
# Use host network (Linux only)
docker run --rm --network host cypress-template npm test

# Or ensure app and tests are on same Docker network
# See docker-compose.yml for network configuration
```

### Slow Builds

Speed up builds with BuildKit:

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Build with BuildKit
docker build -t cypress-template .
```

### Video/Screenshot Issues

If videos or screenshots aren't being saved:

```bash
# Check volume mounts
docker-compose config

# Verify permissions
ls -la cypress/videos cypress/screenshots

# Create directories manually if needed
mkdir -p cypress/videos cypress/screenshots cypress/reports
chmod 777 cypress/videos cypress/screenshots cypress/reports
```

## Docker Image Optimization

### Multi-stage build (optional)

For smaller images, you can use multi-stage builds:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run type-check

# Runtime stage
FROM cypress/included:13.15.2
WORKDIR /app
COPY --from=builder /app .
CMD ["npm", "test"]
```

### Image size

Check image size:

```bash
docker images cypress-template
```

## Best Practices

1. **Use .dockerignore** - Exclude unnecessary files from builds
2. **Cache layers** - Order Dockerfile commands to maximize cache hits
3. **Use volumes** - Mount code for development, artifacts for results
4. **Set resource limits** - Configure memory and CPU limits in docker-compose.yml
5. **Clean up regularly** - Remove unused containers and images
6. **Use specific versions** - Pin Cypress and Node versions in Dockerfile
7. **Test locally first** - Validate Docker setup before pushing to CI/CD

## Cleanup

### Remove containers

```bash
docker-compose down

# Remove with volumes
docker-compose down -v
```

### Remove images

```bash
docker rmi cypress-template
```

### Remove all stopped containers

```bash
docker container prune
```

### Full cleanup

```bash
docker system prune -a
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Cypress Docker Documentation](https://docs.cypress.io/guides/guides/continuous-integration#Docker)
- [Official Cypress Docker Images](https://github.com/cypress-io/cypress-docker-images)
