#!/usr/bin/env node

require('dotenv/config');

const token = process.env.QASE_TESTOPS_API_TOKEN;
const project = process.env.QASE_TESTOPS_PROJECT;

console.log('\n🔍 Qase Configuration Validation\n');
console.log('Token:', token ? '✓ Set' : '✗ Missing');
console.log('Project:', project ? `✓ Set to "${project}"` : '✗ Missing');

if (!token || !project) {
  console.log('\n❌ Missing required environment variables\n');
  process.exit(1);
}

// Test API call
const https = require('https');

const options = {
  hostname: 'api.qase.io',
  path: `/v1/project/${project}`,
  method: 'GET',
  headers: {
    'Token': token,
  },
};

console.log('\n📡 Testing API connection...\n');

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        console.log('✓ API Token is valid');
        console.log(`✓ Project "${project}" exists`);
        console.log(`\nProject Details:`);
        console.log(`  Name: ${response.result?.title}`);
        console.log(`  Code: ${response.result?.code}`);
        console.log('\n✅ All validations passed!\n');
        process.exit(0);
      } catch (e) {
        console.log('✓ API Token is valid');
        console.log(`✓ Project "${project}" exists`);
        console.log('\n✅ Credentials are valid!\n');
        process.exit(0);
      }
    } else if (res.statusCode === 401) {
      console.log('❌ Invalid API Token');
      console.log('Please check your QASE_TESTOPS_API_TOKEN\n');
      process.exit(1);
    } else if (res.statusCode === 404) {
      console.log(`❌ Project "${project}" not found`);
      console.log('Please check your QASE_TESTOPS_PROJECT code\n');
      process.exit(1);
    } else {
      console.log('❌ API Error:', res.statusCode);
      console.log(data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

req.end();
