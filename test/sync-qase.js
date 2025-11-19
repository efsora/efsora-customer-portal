const fs = require('fs');
const path = require('path');

// Load metadata from testCases files
const authTestCases = require('./cypress/e2e/api/testCases.js').authTestCases;
const healthTestCases = require('./cypress/e2e/api/testCases.js').healthTestCases;

// Create lookup maps by test name
const testMetadata = {};

Object.entries(authTestCases).forEach(([testName, metadata]) => {
  testMetadata[testName] = metadata;
});

Object.entries(healthTestCases).forEach(([testName, metadata]) => {
  testMetadata[testName] = metadata;
});

console.log('Metadata from testCases.js files:');
console.log(JSON.stringify(testMetadata, null, 2));
