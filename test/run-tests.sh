#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local..."
  export $(cat .env.local | grep -v '^#' | xargs)
  echo "QASE_API_TOKEN: ${QASE_API_TOKEN:0:10}... (hidden)"
  echo "QASE_PROJECT: $QASE_PROJECT"
else
  echo "Warning: .env.local not found"
fi

# Run tests with environment variables
echo ""
echo "Running API tests with Qase integration..."
npm run test:api
