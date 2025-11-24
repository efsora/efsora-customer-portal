// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// You can change the location of this file or turn off
// automatically serving support files with the 'supportFile'
// configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global before hook - runs once before all tests
before(() => {
  console.log('\n🧪 [TEST_SUITE] Starting test suite...');
  cy.log('Starting test suite');
});

// Global after hook - runs once after all tests
after(() => {
  console.log('🧪 [TEST_SUITE] Test suite completed');
  cy.log('Test suite completed');
});

// Before each test - tracks test execution
beforeEach(function () {
  const testTitle = this.currentTest?.title || 'Unknown test';
  const parent = this.currentTest?.parent?.title || 'Unknown suite';
  console.log(`\n▶️  [TEST_START] ${parent} > ${testTitle}`);
});

// After each test - tracks test completion
afterEach(function () {
  const testTitle = this.currentTest?.title || 'Unknown test';
  const state = this.currentTest?.state || 'unknown';
  const duration = this.currentTest?.duration || 0;

  // Determine if test passed or failed
  const statusIcon = state === 'passed' ? '✅' : '❌';
  console.log(`${statusIcon} [TEST_END] ${testTitle} (${state}) - ${duration}ms`);

  // Log any failures
  if (this.currentTest?.err) {
    console.error(`   Error: ${this.currentTest.err.message}`);
    if (this.currentTest.err.stack) {
      console.error(`   Stack: ${this.currentTest.err.stack.split('\n')[0]}`);
    }
  }
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, _runnable) => {
  // Return false to prevent Cypress from failing the test
  // Customize this based on your needs

  // Example: Ignore specific errors
  if (err.message.includes('ResizeObserver')) {
    return false;
  }

  // Log the error for debugging
  cy.log('Uncaught exception:', err.message);

  // Return true to fail the test (default behavior)
  return true;
});

// Add custom error handling for network failures
Cypress.on('fail', (error, runnable) => {
  // Log additional context on failure
  cy.log('Test failed:', runnable.title);
  cy.log('Error:', error.message);

  // Re-throw the error to fail the test
  throw error;
});
