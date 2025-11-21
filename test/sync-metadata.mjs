import fs from 'fs';
import path from 'path';

// Load metadata
const apiMetadata = await import('./cypress/e2e/api/testCases.ts', { assert: { type: 'json' } }).catch(() => null);
const uiMetadata = await import('./cypress/e2e/ui/testCases.ts', { assert: { type: 'json' } }).catch(() => null);

// Read TypeScript files manually
const readTSFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract test cases using regex
  const testCases = {};
  const pattern = /'([^']+)':\s*\{[\s\n]*description:\s*'([^']+)',[\s\n]*precondition:\s*'([^']*)',[\s\n]*postcondition:\s*'([^']+)'/g;
  
  let match;
  while ((match = pattern.exec(content)) !== null) {
    testCases[match[1]] = {
      description: match[2],
      precondition: match[3],
      postcondition: match[4],
    };
  }
  
  return testCases;
};

const apiTests = readTSFile('./cypress/e2e/api/testCases.ts');
const uiTests = readTSFile('./cypress/e2e/ui/testCases.ts');

console.log('API Tests found:', Object.keys(apiTests).length);
console.log('UI Tests found:', Object.keys(uiTests).length);

// Export for verification
console.log(JSON.stringify({ apiTests, uiTests }, null, 2));
