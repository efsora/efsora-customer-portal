#!/usr/bin/env node

/**
 * Qase Test Metadata Auto-Sync
 *
 * This script automatically syncs test metadata to Qase test cases.
 * Fully automated - no prompts, no confirmations.
 *
 * Called by: /sync-qase-metadata custom command
 */

const fs = require('fs');
const path = require('path');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  box: (title) => {
    console.log(`\n${colors.bold}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}║  ${title.padEnd(38)}║${colors.reset}`);
    console.log(`${colors.bold}╚════════════════════════════════════════╝${colors.reset}\n`);
  },
};

/**
 * Load all test metadata from testCases.js files
 */
function loadMetadata() {
  log.info('Loading test metadata from testCases.js files...');

  const metadata = {};
  const baseDir = path.join(__dirname, '../../test/cypress/e2e');

  try {
    // Load API test cases
    const apiPath = path.join(baseDir, 'api/testCases.js');
    if (fs.existsSync(apiPath)) {
      delete require.cache[require.resolve(apiPath)];
      const apiModule = require(apiPath);
      Object.assign(metadata, apiModule.authTestCases || {});
      Object.assign(metadata, apiModule.healthTestCases || {});
      log.success(`Loaded API test cases (${Object.keys(apiModule.authTestCases || {}).length + Object.keys(apiModule.healthTestCases || {}).length})`);
    }

    // Load UI test cases
    const uiPath = path.join(baseDir, 'ui/testCases.js');
    if (fs.existsSync(uiPath)) {
      delete require.cache[require.resolve(uiPath)];
      const uiModule = require(uiPath);
      Object.assign(metadata, uiModule.uiTestCases || {});
      const uiCount = Object.keys(uiModule.uiTestCases || {}).length;
      if (uiCount > 0) {
        log.success(`Loaded UI test cases (${uiCount})`);
      }
    }
  } catch (error) {
    log.warn(`Error loading metadata: ${error.message}`);
  }

  return metadata;
}

/**
 * Main execution
 */
async function main() {
  log.box('Syncing Qase Test Metadata');

  try {
    // Load metadata
    const metadata = loadMetadata();
    const testCount = Object.keys(metadata).length;

    if (testCount === 0) {
      log.warn('No test metadata found');
      return;
    }

    log.success(`Loaded ${testCount} test cases\n`);

    // Display test cases
    console.log(`${colors.bold}Test cases ready to sync:${colors.reset}\n`);
    Object.entries(metadata).forEach(([name, meta], idx) => {
      console.log(`  ${idx + 1}. ${name}`);
      if (meta.description) {
        console.log(`     → ${meta.description.substring(0, 60)}${meta.description.length > 60 ? '...' : ''}`);
      }
    });

    log.box('Next Steps');
    console.log('To complete the sync:\n');
    console.log(`  1. Fetch all test cases from Qase project ECP`);
    console.log(`  2. Match test cases by name`);
    console.log(`  3. Update each matching case with:\n`);
    console.log(`     - description`);
    console.log(`     - preconditions`);
    console.log(`     - postconditions\n`);
    console.log(`  Total to update: ${colors.bold}${testCount}${colors.reset}\n`);

    // Export metadata for use by MCP operations
    console.log(`${colors.yellow}═════════════════════════════════════════${colors.reset}`);
    console.log('\n' + JSON.stringify({
      status: 'ready',
      totalTestCases: testCount,
      metadata: metadata,
    }));

  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
