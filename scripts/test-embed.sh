#!/bin/bash

# Test script for /api/v1/documents/embed endpoint
# Usage: ./scripts/test-embed.sh

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_URL="${BASE_URL}/api/v1"

# Test user credentials
EMAIL="test-embed@example.com"
PASSWORD="securePassword123"
NAME="Test"
SURNAME="Embed"

# Embed payload - update these values as needed
# Note: S3 key should be just the path within the bucket (not the full s3:// URI)
S3_KEY="documents/1/1/98550bbb-9fd1-4313-9177-275d7d385000_All_Sober_SOW_-_1__1_.pdf"
PROJECT_ID=1
COLLECTION_NAME="EfsoraDocs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Embed Endpoint Test Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check if backend is running
echo -e "${YELLOW}[1/5] Checking backend health...${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health")
if [ "$HEALTH_RESPONSE" != "200" ]; then
    echo -e "${RED}Backend is not running at ${BASE_URL}${NC}"
    echo "Please start the services with: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d"
    exit 1
fi
echo -e "${GREEN}Backend is healthy${NC}"
echo ""

# Step 2: Try to login first, if fails then create invitation and register
echo -e "${YELLOW}[2/5] Authenticating...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"${EMAIL}\",
        \"password\": \"${PASSWORD}\"
    }")

# Check if login was successful
if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}Login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${YELLOW}Login failed, creating invitation and registering...${NC}"

    # Step 2a: Send invitation first (required before registration)
    echo -e "${YELLOW}[2a/5] Sending invitation...${NC}"
    INVITATION_RESPONSE=$(curl -s -X POST "${API_URL}/auth/send-invitation" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${EMAIL}\"
        }")

    if echo "$INVITATION_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}Invitation sent successfully${NC}"
    elif echo "$INVITATION_RESPONSE" | grep -q 'INVITATION_ALREADY_EXISTS'; then
        echo -e "${YELLOW}Invitation already exists, continuing...${NC}"
    else
        echo -e "${RED}Failed to send invitation:${NC}"
        echo "$INVITATION_RESPONSE" | jq . 2>/dev/null || echo "$INVITATION_RESPONSE"
        exit 1
    fi

    # Step 2b: Register user
    echo -e "${YELLOW}[2b/5] Registering user...${NC}"
    REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${EMAIL}\",
            \"name\": \"${NAME}\",
            \"surname\": \"${SURNAME}\",
            \"password\": \"${PASSWORD}\"
        }")

    if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}Registration successful${NC}"
        TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    else
        echo -e "${RED}Registration failed:${NC}"
        echo "$REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"
        exit 1
    fi
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to obtain token${NC}"
    exit 1
fi

echo -e "${GREEN}Token obtained: ${TOKEN:0:50}...${NC}"
echo ""

# Step 3: Display request info
echo -e "${YELLOW}[3/5] Request details:${NC}"
echo -e "  URL: ${API_URL}/documents/embed"
echo -e "  S3 Key: ${S3_KEY}"
echo -e "  Project ID: ${PROJECT_ID}"
echo -e "  Collection: ${COLLECTION_NAME}"
echo ""

# Step 4: Call embed endpoint (SSE stream)
echo -e "${YELLOW}[4/5] Calling embed endpoint (SSE stream)...${NC}"
echo -e "${BLUE}----------------------------------------${NC}"
echo ""

curl -N -X POST "${API_URL}/documents/embed" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "{
        \"s3Key\": \"${S3_KEY}\",
        \"projectId\": ${PROJECT_ID},
        \"collectionName\": \"${COLLECTION_NAME}\"
    }"

echo ""
echo -e "${BLUE}----------------------------------------${NC}"
echo -e "${YELLOW}[5/5] Done${NC}"
echo -e "${GREEN}Test completed${NC}"
