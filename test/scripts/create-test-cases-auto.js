#!/usr/bin/env node

/**
 * Automatic Test Case Creation Script for Qase.io
 *
 * This script automatically discovers test files in your Cypress project
 * and creates corresponding test cases in Qase.io with proper suite structure.
 *
 * Suite Organization:
 * - Root: API / UI (by test type)
 *   - Level 2: File name (e.g., auth.api.cy.ts → Auth)
 *   - Level 3: Test cases from that file
 *
 * Features:
 * - Scans cypress/e2e directory for test files
 * - Organizes test cases by suite structure (API/UI → File → Test Case)
 * - Creates hierarchical suite structure in Qase
 * - Extracts test descriptions from test code
 * - Avoids duplicates (skips if @qaseId already exists)
 *
 * Usage:
 *   node scripts/create-test-cases-auto.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const QASE_API_URL = 'https://api.qase.io/v1';
const QASE_TOKEN = process.env.QASE_TOKEN;
const QASE_PROJECT = process.env.QASE_PROJECT;
const E2E_TESTS_PATH = path.join(__dirname, '../cypress/e2e');

// Color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
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
 * Get all suites for a project (cached)
 */
let suiteCache = {};
async function getAllSuites(projectCode) {
  if (suiteCache[projectCode]) {
    return suiteCache[projectCode];
  }

  try {
    const response = await qaseRequest('GET', `/suite/${projectCode}`);
    suiteCache[projectCode] = response.result.entities || [];
    return suiteCache[projectCode];
  } catch (error) {
    console.error(`${colors.red}Error fetching suites: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Get or create suite by name with parent
 */
async function getOrCreateSuite(projectCode, suiteName, parentSuiteId = null) {
  try {
    const allSuites = await getAllSuites(projectCode);

    // Check if suite already exists
    const existingSuite = allSuites.find(
      (suite) => suite.title === suiteName && (parentSuiteId ? suite.parent_id === parentSuiteId : !suite.parent_id)
    );

    if (existingSuite) {
      return existingSuite;
    }

    // Create new suite
    const createBody = {
      title: suiteName,
      ...(parentSuiteId && { parent_id: parentSuiteId }),
    };

    const createResponse = await qaseRequest('POST', `/suite/${projectCode}`, createBody);
    const newSuite = createResponse.result;

    // Add to cache
    suiteCache[projectCode].push(newSuite);

    return newSuite;
  } catch (error) {
    console.error(`${colors.red}Error getting/creating suite "${suiteName}": ${error.message}${colors.reset}`);
    throw error;
  }
}

/**
 * Parse test file to extract test cases
 */
function parseTestFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const testCases = [];

  // Match the main describe block title
  const mainDescribeRegex = /describe\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\(\)/;
  const mainDescribeMatch = content.match(mainDescribeRegex);
  const mainDescribe = mainDescribeMatch ? mainDescribeMatch[1] : '';

  // Match it blocks with optional @qaseId comments
  const itRegex = /(?:\/\*\*\s*@qaseId\s+(\d+)\s*\*\/\s*)?it\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let itMatch;

  while ((itMatch = itRegex.exec(content)) !== null) {
    const [, qaseId, testTitle] = itMatch;
    testCases.push({
      title: testTitle,
      qaseId: qaseId ? parseInt(qaseId) : null,
    });
  }

  return {
    mainDescribe,
    testCases,
  };
}

/**
 * Convert file name to suite name
 * e.g., "auth.api.cy.ts" → "Auth", "login.cy.ts" → "Login"
 */
function fileNameToSuiteName(fileName) {
  // Remove extension and .api/.cy suffixes
  const baseName = fileName
    .replace(/\.cy\.ts$/, '')
    .replace(/\.api$/, '')
    .replace(/\.cy$/, '');

  // Convert camelCase/snake_case to Title Case
  return baseName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

/**
 * Discover all test files
 */
function discoverTestFiles() {
  const files = [];

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.cy.ts')) {
        files.push(fullPath);
      }
    }
  }

  walkDir(E2E_TESTS_PATH);
  return files;
}

/**
 * Build test structure from files organized by category → file → tests
 */
function buildTestStructure(files) {
  const structure = {};

  for (const filePath of files) {
    const { mainDescribe, testCases } = parseTestFile(filePath);
    const relativeDir = path.dirname(filePath.replace(E2E_TESTS_PATH, ''));
    const category = relativeDir.includes('api') ? 'API' : 'UI';
    const fileName = path.basename(filePath);

    if (!structure[category]) {
      structure[category] = {};
    }

    structure[category][fileName] = {
      filePath,
      suiteName: fileNameToSuiteName(fileName),
      mainDescribe,
      testCases,
    };
  }

  return structure;
}

/**
 * Create test case in Qase
 */
async function createTestCase(projectCode, suiteId, testTitle, description) {
  try {
    const endpoint = `/case/${projectCode}`;
    const body = {
      title: testTitle,
      description: description,
      suite_id: suiteId,
    };

    const response = await qaseRequest('POST', endpoint, body);
    return response.result;
  } catch (error) {
    console.error(`${colors.red}Error creating test case: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${colors.cyan}${colors.bright}🧪 Qase.io Automatic Test Case Creator${colors.reset}\n`);

  // Validate configuration
  if (!QASE_TOKEN) {
    console.error(`${colors.red}Error: QASE_TOKEN not found in .env${colors.reset}`);
    process.exit(1);
  }

  if (!QASE_PROJECT) {
    console.error(`${colors.red}Error: QASE_PROJECT not found in .env${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.cyan}Configuration:${colors.reset}`);
  console.log(`  Project Code: ${QASE_PROJECT}`);
  console.log(`  Test Path: ${E2E_TESTS_PATH}\n`);

  try {
    // Discover test files
    console.log(`${colors.yellow}📂 Discovering test files...${colors.reset}`);
    const testFiles = discoverTestFiles();
    console.log(`${colors.green}✓ Found ${testFiles.length} test file(s)${colors.reset}\n`);

    if (testFiles.length === 0) {
      console.log(`${colors.yellow}No test files found in ${E2E_TESTS_PATH}${colors.reset}`);
      process.exit(0);
    }

    // Build structure
    console.log(`${colors.yellow}🏗️  Building test structure...${colors.reset}`);
    const structure = buildTestStructure(testFiles);

    // Display structure
    console.log(`${colors.cyan}Structure:${colors.reset}`);
    for (const [category, files] of Object.entries(structure)) {
      console.log(`  ${category}/`);
      for (const [fileName, data] of Object.entries(files)) {
        console.log(`    ├── ${data.suiteName} (${data.testCases.length} tests)`);
      }
    }
    console.log();

    // Create suites and test cases
    let totalCreated = 0;
    let totalSkipped = 0;

    for (const [category, categoryFiles] of Object.entries(structure)) {
      console.log(`\n${colors.bright}${category} Tests${colors.reset}`);
      console.log('═'.repeat(60));

      // Create category suite (root level)
      const categorySuite = await getOrCreateSuite(QASE_PROJECT, category);
      console.log(`${colors.green}✓${colors.reset} Suite: ${category} (ID: ${categorySuite.id})\n`);

      // Process each file
      for (const [fileName, fileData] of Object.entries(categoryFiles)) {
        const { suiteName, mainDescribe, testCases } = fileData;

        // Create file suite under category
        const fileSuite = await getOrCreateSuite(QASE_PROJECT, suiteName, categorySuite.id);
        console.log(`${colors.green}✓${colors.reset} Suite: ${suiteName} (ID: ${fileSuite.id})`);

        // Create test cases under file suite
        for (const testCase of testCases) {
          // Skip if already has qaseId
          if (testCase.qaseId) {
            console.log(
              `  ${colors.yellow}⊘${colors.reset} Skipped: "${testCase.title}" (already #${testCase.qaseId})`
            );
            totalSkipped++;
            continue;
          }

          const description = `${mainDescribe}`;
          const created = await createTestCase(QASE_PROJECT, fileSuite.id, testCase.title, description);

          if (created) {
            console.log(`  ${colors.green}✓${colors.reset} Created: "${testCase.title}" (ID: #${created.id})`);
            totalCreated++;
          } else {
            console.log(`  ${colors.red}✗${colors.reset} Failed: "${testCase.title}"`);
          }
        }
      }
    }

    // Summary
    console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}📊 Summary:${colors.reset}`);
    console.log(`  ${colors.green}Created${colors.reset}:  ${totalCreated}`);
    console.log(`  ${colors.yellow}Skipped${colors.reset}:  ${totalSkipped}`);
    console.log(`  ${colors.bright}Total${colors.reset}:    ${totalCreated + totalSkipped}\n`);

    if (totalCreated > 0) {
      console.log(`${colors.green}${colors.bright}✓ Test cases created successfully!${colors.reset}`);
      console.log(`${colors.cyan}Visit: https://app.qase.io/project/${QASE_PROJECT}${colors.reset}\n`);
    } else if (totalSkipped > 0) {
      console.log(`${colors.yellow}All test cases already linked to Qase IDs${colors.reset}\n`);
    }
  } catch (error) {
    console.error(`${colors.red}${colors.bright}✗ Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

main();
