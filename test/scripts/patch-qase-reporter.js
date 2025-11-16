#!/usr/bin/env node

/**
 * Qase Reporter Monkey Patch
 *
 * This script patches the cypress-qase-reporter to properly inject run_id
 * into test results. The reporter has a bug where run_id is hardcoded to null.
 *
 * This patch modifies the reporter.js file to use the actual run_id from the
 * Qase reporter instance.
 */

const fs = require('fs');
const path = require('path');

const reporterPath = path.join(
  __dirname,
  '../node_modules/cypress-qase-reporter/dist/reporter.js'
);

console.log('[PATCH] Reading reporter.js...');

if (!fs.existsSync(reporterPath)) {
  console.error('[ERROR] Reporter file not found at:', reporterPath);
  process.exit(1);
}

let content = fs.readFileSync(reporterPath, 'utf-8');

// Check if already patched
if (content.includes('// PATCHED: run_id injection')) {
  console.log('[INFO] Reporter already patched');
  process.exit(0);
}

// Replace the hardcoded run_id: null with dynamic run_id
const oldCode = 'run_id: null,';
const newCode = `// PATCHED: run_id injection
            run_id: this.reporter?.state?.runId || this.options?.testops?.run?.id || null,`;

if (!content.includes(oldCode)) {
  console.error('[ERROR] Could not find target code to patch');
  console.error('Looking for:', oldCode);
  process.exit(1);
}

content = content.replace(oldCode, newCode);

console.log('[PATCH] Writing patched reporter.js...');
fs.writeFileSync(reporterPath, content, 'utf-8');

console.log('[SUCCESS] Reporter patched successfully!');
console.log('[INFO] run_id will now be properly injected from reporter options');
