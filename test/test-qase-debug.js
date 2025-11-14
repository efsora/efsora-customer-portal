#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('\n=== QASE CONFIGURATION DEBUG ===\n');

// 1. Check .env.local exists
const envPath = path.resolve(__dirname, '.env.local');
console.log(`1. Checking .env.local at: ${envPath}`);
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env.local EXISTS');
  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.includes('QASE'));
  console.log('   QASE variables in .env.local:');
  lines.forEach(line => {
    if (line.startsWith('QASE')) console.log(`     ${line}`);
  });
} else {
  console.log('   ❌ .env.local NOT FOUND');
}

// 2. Load .env.local
console.log('\n2. Loading .env.local via dotenv.config()');
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.log(`   ❌ Error: ${envResult.error.message}`);
} else {
  console.log(`   ✅ Loaded ${Object.keys(envResult.parsed || {}).length} variables`);
}

// 3. Check process.env after loading
console.log('\n3. Checking process.env.QASE_* variables:');
const qaseVars = Object.keys(process.env).filter(key => key.startsWith('QASE'));
if (qaseVars.length === 0) {
  console.log('   ❌ NO QASE variables found in process.env');
} else {
  qaseVars.forEach(key => {
    const value = process.env[key];
    if (value.length > 20) {
      console.log(`   ✅ ${key} = ${value.substring(0, 10)}...${value.substring(value.length - 5)}`);
    } else {
      console.log(`   ✅ ${key} = ${value}`);
    }
  });
}

// 4. Check qase.config.json
const qaseConfigPath = path.resolve(__dirname, 'qase.config.json');
console.log(`\n4. Checking qase.config.json at: ${qaseConfigPath}`);
if (fs.existsSync(qaseConfigPath)) {
  console.log('   ✅ qase.config.json EXISTS');
  const qaseConfig = JSON.parse(fs.readFileSync(qaseConfigPath, 'utf-8'));
  console.log(`   mode: ${qaseConfig.mode}`);
  console.log(`   debug: ${qaseConfig.debug}`);
  console.log(`   testops.project: ${qaseConfig.testops?.project}`);
  console.log(`   testops.run.title: ${qaseConfig.testops?.run?.title}`);
} else {
  console.log('   ❌ qase.config.json NOT FOUND');
}

// 5. Check if qase.config.json at monorepo root
const qaseConfigRootPath = path.resolve(__dirname, '..', 'qase.config.json');
console.log(`\n5. Checking qase.config.json at monorepo root: ${qaseConfigRootPath}`);
if (fs.existsSync(qaseConfigRootPath)) {
  console.log('   ⚠️  FOUND - This might override test/qase.config.json');
} else {
  console.log('   ✅ Not found (good)');
}

console.log('\n=== END DEBUG ===\n');
