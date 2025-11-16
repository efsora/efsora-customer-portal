#!/usr/bin/env node

/**
 * Delete All Test Cases from Qase
 *
 * This script deletes ALL test cases from a Qase project.
 * WARNING: This is destructive and cannot be undone!
 *
 * Usage:
 *   node scripts/delete-all-test-cases.js
 */

require('dotenv').config();
const QASE_API_URL = 'https://api.qase.io/v1';
const QASE_TOKEN = process.env.QASE_TOKEN;
const QASE_PROJECT = process.env.QASE_PROJECT;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

/**
 * Makes HTTP request to Qase API
 */
async function qaseRequest(method, endpoint, body = null) {
  const url = `${QASE_API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Token': QASE_TOKEN,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${data.errors?.[0]?.message || JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to call Qase API: ${error.message}`);
  }
}

/**
 * Get all test cases
 */
async function getAllTestCases(projectCode) {
  try {
    const cases = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await qaseRequest('GET', `/case/${projectCode}?limit=${limit}&offset=${offset}`);
      cases.push(...(response.result.entities || []));
      hasMore = response.result.entities && response.result.entities.length === limit;
      offset += limit;
    }

    return cases;
  } catch (error) {
    throw new Error(`Failed to get test cases: ${error.message}`);
  }
}

/**
 * Delete a test case
 */
async function deleteTestCase(projectCode, caseId) {
  try {
    await qaseRequest('DELETE', `/case/${projectCode}/${caseId}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error deleting case #${caseId}: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${colors.cyan}${colors.bright}🗑️  Qase Test Case Deletion Tool${colors.reset}\n`);

  // Validate configuration
  if (!QASE_TOKEN) {
    console.error(`${colors.red}Error: QASE_TOKEN not found in .env${colors.reset}`);
    process.exit(1);
  }

  if (!QASE_PROJECT) {
    console.error(`${colors.red}Error: QASE_PROJECT not found in .env${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.yellow}⚠️  WARNING: This will DELETE ALL test cases from project ${QASE_PROJECT}${colors.reset}`);
  console.log(`${colors.yellow}This action cannot be undone!${colors.reset}\n`);

  // Ask for confirmation
  console.log(`${colors.red}${colors.bright}Are you sure? Type "DELETE ALL" to confirm:${colors.reset}`);

  // Simple stdin check for Node.js
  if (process.argv[2] === '--confirm') {
    console.log(`${colors.red}Proceeding with deletion...${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}Skipped. Run with --confirm flag to proceed:${colors.reset}`);
    console.log(`  node scripts/delete-all-test-cases.js --confirm\n`);
    process.exit(0);
  }

  try {
    // Get all test cases
    console.log(`${colors.cyan}Fetching all test cases...${colors.reset}`);
    const testCases = await getAllTestCases(QASE_PROJECT);

    if (testCases.length === 0) {
      console.log(`${colors.yellow}No test cases found${colors.reset}\n`);
      process.exit(0);
    }

    console.log(`${colors.bright}Found ${testCases.length} test case(s)${colors.reset}\n`);

    // Delete all test cases
    console.log(`${colors.red}Deleting test cases...${colors.reset}`);
    let deleted = 0;
    let failed = 0;

    for (const testCase of testCases) {
      const result = await deleteTestCase(QASE_PROJECT, testCase.id);
      if (result) {
        deleted++;
        console.log(`${colors.red}✗${colors.reset} Deleted: #${testCase.id} - ${testCase.title}`);
      } else {
        failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary
    console.log(`\n${colors.cyan}${'─'.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}Summary:${colors.reset}`);
    console.log(`  ${colors.red}Deleted${colors.reset}: ${deleted}`);
    if (failed > 0) {
      console.log(`  ${colors.red}Failed${colors.reset}:  ${failed}`);
    }
    console.log(`  ${colors.bright}Total${colors.reset}:   ${deleted + failed}\n`);

    if (deleted > 0) {
      console.log(`${colors.red}${colors.bright}✓ All test cases deleted!${colors.reset}\n`);
    }
  } catch (error) {
    console.error(`${colors.red}${colors.bright}✗ Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

main();
