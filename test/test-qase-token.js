const fs = require('fs');
const path = require('path');

// Load token from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const tokenMatch = envContent.match(/QASE_TESTOPS_API_TOKEN=(.+)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

if (!token) {
  console.error('❌ No QASE_API_TOKEN found in .env.local');
  process.exit(1);
}

console.log('Testing Qase API token...');
console.log('Token:', token.substring(0, 10) + '...');

// Test against Qase API
fetch('https://api.qase.io/v1/user', {
  headers: { 'Token': token }
})
  .then(res => {
    if (res.ok) {
      console.log('✅ API Token is VALID');
      return res.json().then(data => {
        console.log('User email:', data.result?.email || 'N/A');
        console.log('User id:', data.result?.id || 'N/A');
      });
    } else {
      console.error('❌ API Token is INVALID');
      console.error('Status:', res.status);
      return res.json().then(data => console.error('Response:', JSON.stringify(data, null, 2)));
    }
  })
  .catch(err => console.error('❌ Request failed:', err.message));
