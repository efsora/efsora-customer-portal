#!/usr/bin/env node

/**
 * Qase Metadata Sync Executor
 *
 * This script coordinates the full sync process:
 * 1. Load metadata
 * 2. Get Qase test cases
 * 3. Match and update
 * 4. Report results
 *
 * This is called by the /sync-qase-metadata command handler.
 */

const fs = require('fs');
const path = require('path');

// Load metadata
function loadMetadata() {
  const metadata = {};
  const baseDir = path.join(__dirname, '../../test/cypress/e2e');

  try {
    const apiPath = path.join(baseDir, 'api/testCases.js');
    if (fs.existsSync(apiPath)) {
      delete require.cache[require.resolve(apiPath)];
      const apiModule = require(apiPath);
      Object.assign(metadata, apiModule.authTestCases || {});
      Object.assign(metadata, apiModule.healthTestCases || {});
    }

    const uiPath = path.join(baseDir, 'ui/testCases.js');
    if (fs.existsSync(uiPath)) {
      delete require.cache[require.resolve(uiPath)];
      const uiModule = require(uiPath);
      Object.assign(metadata, uiModule.uiTestCases || {});
    }
  } catch (error) {
    console.error('Error loading metadata:', error.message);
  }

  return metadata;
}

// Output the metadata and test cases for MCP processing
const metadata = loadMetadata();

console.log('\n╔════════════════════════════════════════╗');
console.log('║  Qase Metadata Sync Ready              ║');
console.log('╚════════════════════════════════════════╝\n');

console.log(`📂 Loaded: ${Object.keys(metadata).length} test cases`);
console.log('🔄 Status: Ready for MCP sync\n');

// Output data in a format that can be processed
console.log('TEST_CASES_METADATA=' + JSON.stringify({
  count: Object.keys(metadata).length,
  data: metadata,
  project: 'ECP',
  timestamp: new Date().toISOString(),
}));
