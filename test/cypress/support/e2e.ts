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
  cy.log('Starting test suite');
});

// Global after hook - runs once after all tests
after(() => {
  cy.log('Test suite completed');
});

// Before each test
beforeEach(() => {
  // Clear cookies and local storage before each test for isolation
  // cy.clearCookies();
  // cy.clearLocalStorage();

  // Preserve session if using cy.session()
  // Cypress.session.clearAllSavedSessions();
});

// After each test
afterEach(() => {
  // Take screenshot on failure
  // This is handled automatically by Cypress when screenshotOnRunFailure is true
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
