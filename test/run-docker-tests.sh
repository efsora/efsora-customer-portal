#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Running Cypress E2E Tests in Docker${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if main app services are running
echo -e "${YELLOW}Checking if main application services are running...${NC}"
if ! docker ps | grep -q "full-stack-frontend"; then
    echo -e "${RED}Error: Frontend service is not running!${NC}"
    echo -e "${YELLOW}Please start services first:${NC}"
    echo -e "  cd .. && docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d"
    exit 1
fi

if ! docker ps | grep -q "full-stack-backend"; then
    echo -e "${RED}Error: Backend service is not running!${NC}"
    echo -e "${YELLOW}Please start services first:${NC}"
    echo -e "  cd .. && docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d"
    exit 1
fi

echo -e "${GREEN}✓ All required services are running${NC}\n"

# Build test image
echo -e "${YELLOW}Building Cypress test image...${NC}"
docker-compose build cypress-tests

# Run tests
echo -e "${YELLOW}Running Cypress tests...${NC}\n"
docker-compose run --rm cypress-tests

# Capture exit code
TEST_EXIT_CODE=$?

echo -e "\n${GREEN}========================================${NC}"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Tests completed successfully!${NC}"
else
    echo -e "${RED}✗ Tests failed with exit code: $TEST_EXIT_CODE${NC}"
fi
echo -e "${GREEN}========================================${NC}"

exit $TEST_EXIT_CODE
