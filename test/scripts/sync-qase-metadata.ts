/**
 * Sync test metadata to Qase test cases
 * Updates description, preconditions, and postconditions for all test cases
 * Matches test cases by name
 *
 * Usage: npx ts-node scripts/sync-qase-metadata.ts
 */

const { authTestCases, healthTestCases } = require('../cypress/e2e/api/testCases');

const QASE_API_URL = 'https://api.qase.io/v1';

const QASE_API_TOKEN = process.env.QASE_TOKEN;
const QASE_PROJECT = process.env.QASE_PROJECT;

if (!QASE_API_TOKEN || !QASE_PROJECT) {
  console.error('Error: QASE_TOKEN and QASE_PROJECT must be set in .env');
  process.exit(1);
}

// Combine all test metadata
const allTestCases = {
  ...authTestCases,
  ...healthTestCases,
};

async function fetchAPI(endpoint: string, method = 'GET', body: unknown = null) {
  const options: RequestInit = {
    method,
    headers: {
      'Token': QASE_API_TOKEN!,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${QASE_API_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

async function getQaseTestCases() {
  console.log(`\n📦 Fetching test cases from Qase project: ${QASE_PROJECT}`);
  const data = await fetchAPI(`/cases/${QASE_PROJECT}?limit=300`);
  return data.result.entities;
}

async function updateTestCaseMetadata(caseId: number, testName: string, metadata: any) {
  const payload = {
    description: metadata.description,
    preconditions: metadata.precondition,
    postconditions: metadata.postcondition,
  };

  await fetchAPI(`/cases/${QASE_PROJECT}/${caseId}`, 'PATCH', payload);
  return true;
}

async function syncMetadata() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Qase Test Metadata Sync               ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    // Get all test cases from Qase
    const qaseCases = await getQaseTestCases();
    console.log(`Found ${qaseCases.length} test cases in Qase`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    // Match and update
    for (const qaseCase of qaseCases) {
      const testName = qaseCase.title;
      const metadata = allTestCases[testName as keyof typeof allTestCases];

      if (metadata) {
        try {
          console.log(`\n✓ Matched: "${testName}"`);
          console.log(`  📝 Updating case ${qaseCase.id}...`);
          await updateTestCaseMetadata(qaseCase.id, testName, metadata);
          console.log(`  ✅ Updated`);
          updated++;
        } catch (error: unknown) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`  ❌ Error updating case ${qaseCase.id}:`, errorMsg);
          failed++;
        }
      } else {
        console.log(`  ⊘ Skipping (no metadata): "${testName}"`);
        skipped++;
      }
    }

    // Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Sync Summary                          ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`Updated:  ${updated}`);
    console.log(`Skipped:  ${skipped}`);
    console.log(`Failed:   ${failed}`);
    console.log(`Total:    ${qaseCases.length}\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Fatal error:', errorMsg);
    process.exit(1);
  }
}

syncMetadata();
