#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('\n=== QASE SETUP VERIFICATION ===\n');

// Load .env.local
const envPath = path.resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

console.log('Environment Variables Loaded:');
console.log(`  QASE_MODE: ${process.env.QASE_MODE}`);
console.log(`  QASE_TESTOPS_API_TOKEN: ${process.env.QASE_TESTOPS_API_TOKEN ? '✅ SET' : '❌ NOT SET'}`);
console.log(`  QASE_TESTOPS_PROJECT: ${process.env.QASE_TESTOPS_PROJECT}`);

// Check qase.config.json at monorepo root
const qaseConfigRoot = path.resolve(__dirname, '..', 'qase.config.json');
console.log(`\nqase.config.json at monorepo root: ${qaseConfigRoot}`);
if (fs.existsSync(qaseConfigRoot)) {
  const qaseConfig = JSON.parse(fs.readFileSync(qaseConfigRoot, 'utf-8'));
  console.log('✅ File exists');
  console.log(`  mode: ${qaseConfig.mode}`);
  console.log(`  testops.project: ${qaseConfig.testops?.project}`);
  console.log(`  testops.run.title: ${qaseConfig.testops?.run?.title}`);
  console.log(`  testops.run.complete: ${qaseConfig.testops?.run?.complete}`);
  console.log(`  testops.create: ${qaseConfig.testops?.create}`);
} else {
  console.log('❌ File NOT found');
}

// Test Qase API connection
console.log('\n--- Testing Qase API Connection ---');
const token = process.env.QASE_TESTOPS_API_TOKEN;
const project = process.env.QASE_TESTOPS_PROJECT;

if (!token || !project) {
  console.log('❌ Missing token or project');
  process.exit(1);
}

const https = require('https');

const options = {
  hostname: 'api.qase.io',
  path: `/v1/project/${project}`,
  method: 'GET',
  headers: {
    'Token': token,
    'Content-Type': 'application/json',
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.status === true) {
        console.log(`✅ API Connection Successful`);
        console.log(`   Project: ${parsed.result?.title}`);
      } else {
        console.log(`❌ API Error: ${parsed.error}`);
      }
    } catch (e) {
      console.log(`❌ Failed to parse response: ${e.message}`);
    }
  });
});

req.on('error', (e) => {
  console.log(`❌ API Connection Failed: ${e.message}`);
});

req.end();
