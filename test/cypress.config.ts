import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';
import { afterSpecHook } from 'cypress-qase-reporter/hooks';

/**
 * Load environment variables
 * Priority:
 * 1. System environment variables (from CI/CD or shell export)
 * 2. .env.local file (for local development)
 */
function loadEnvironmentVariables() {
  // First, try to load from .env.local if it exists
  const envPath = path.resolve(__dirname, '.env.local');

  if (fs.existsSync(envPath)) {
    console.log(`📁 Loading environment variables from: ${envPath}`);
    const envResult = dotenv.config({ path: envPath });

    if (envResult.error) {
      console.warn(`⚠️  Could not load .env.local: ${envResult.error.message}`);
    } else {
      console.log(`✅ Loaded ${Object.keys(envResult.parsed || {}).length} variables from .env.local`);
      // Verify variables are in process.env
      console.log(`   QASE_API_TOKEN in process.env: ${process.env.QASE_API_TOKEN ? '✅' : '❌'}`);
      console.log(`   QASE_PROJECT in process.env: ${process.env.QASE_PROJECT ? '✅' : '❌'}`);
    }
  } else {
    console.log(`📋 No .env.local found. Using system environment variables (CI/CD mode)`);
  }

  // Validate that required variables are set (from either source)
  const qaseToken = process.env.QASE_API_TOKEN;
  const qaseProject = process.env.QASE_PROJECT || 'ECP';
  const qaseRunId = process.env.QASE_RUN_ID;

  console.log(`🔑 Qase Configuration:`);
  console.log(`   Token: ${qaseToken ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   Token Length: ${qaseToken?.length || 0}`);
  console.log(`   Token First 10 chars: ${qaseToken?.substring(0, 10) || 'N/A'}`);
  console.log(`   Project: ${qaseProject}`);
  console.log(`   Run ID: ${qaseRunId ? `✅ ${qaseRunId}` : '(auto-create new run)'}`);

  if (!qaseToken) {
    console.warn(`\n⚠️  WARNING: QASE_API_TOKEN is not set!`);
    console.warn(`   Results will NOT be uploaded to Qase.`);
    console.warn(`   For local development: Create test/.env.local with QASE_API_TOKEN and QASE_PROJECT`);
    console.warn(`   For CI/CD: Set QASE_API_TOKEN and QASE_PROJECT environment variables\n`);
  }

  return {
    token: qaseToken || '',
    project: qaseProject,
    runId: qaseRunId,
  };
}

const qaseConfig = loadEnvironmentVariables();


export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    chromeWebSecurity: false,
    watchForFileChanges: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'spec, cypress-qase-reporter',
      specReporter: {
        suitesFormat: 'indent',
        outputFile: 'cypress/reports/spec-output.json',
      },
      cypressQaseReporterReporterOptions: {
        mode: process.env.QASE_API_TOKEN ? 'testops' : 'off',
        debug: true,
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN || '',
          },
          project: process.env.QASE_PROJECT || 'ECP',
          uploadAttachments: true,
          autocreate: true,
          run: process.env.QASE_RUN_ID
            ? { id: process.env.QASE_RUN_ID, complete: false }
            : {
                title: `Automated run ${new Date().toISOString()}`,
                description: 'Automated test run from Cypress',
                complete: false,
              },
        },
        framework: {
          cypress: {
            screenshotsFolder: 'cypress/screenshots',
            videosFolder: 'cypress/videos',
            uploadDelay: 5,  // Wait 5 seconds for attachments to upload
          },
        },
      },
    },
    env: {
      apiUrl: 'http://localhost:3000/api/v1',
    },
    setupNodeEvents(on: any, config: any) {
      // Load environment-specific configuration
      const environment = config.env.environment || 'dev';
      const configFile = path.join(__dirname, 'cypress', 'config', `${environment}.json`);

      if (fs.existsSync(configFile)) {
        const envConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

        // Merge environment config with base config
        config.baseUrl = envConfig.baseUrl || config.baseUrl;
        config.env = { ...config.env, ...envConfig };

        console.log(`Loaded ${environment} environment configuration`);
      } else {
        console.warn(`Config file not found: ${configFile}, using default configuration`);
      }

      // Update reporter options with Qase configuration
      if (config.reporterOptions && config.reporterOptions.cypressQaseReporterReporterOptions) {
        const reporterQaseConfig = config.reporterOptions.cypressQaseReporterReporterOptions;

        // CRITICAL: Ensure mode is set to testops if token is available
        if (qaseConfig.token) {
          reporterQaseConfig.mode = 'testops';
          console.log(`✅ Qase reporter mode set to: testops`);
        }

        if (reporterQaseConfig.testops) {
          reporterQaseConfig.testops.api = {
            token: qaseConfig.token,
          };
          reporterQaseConfig.testops.project = qaseConfig.project;

          // Set run ID or create new run (keep run open until all tests finish)
          if (qaseConfig.runId) {
            reporterQaseConfig.testops.run = { id: qaseConfig.runId, complete: false };
            console.log(`✅ Qase reporter configured - Reporting to Run: ${qaseConfig.runId}, Project: ${qaseConfig.project}`);
          } else {
            reporterQaseConfig.testops.run = {
              title: `Automated run ${new Date().toISOString()}`,
              description: 'Automated test run from Cypress',
              complete: false,
            };
            console.log(`✅ Qase reporter configured - Creating new run, Project: ${qaseConfig.project}`);
          }
        }
      }

      // Add metadata collection hook FIRST (REQUIRED for qase() decorators to work)
      console.log(`\n${'═'.repeat(80)}`);
      console.log(`📍 [SETUP] Initializing Qase metadata collection hook...`);
      console.log(`${'═'.repeat(80)}`);

      try {
        require('cypress-qase-reporter/metadata')(on);
        console.log(`✅ [SETUP] Qase metadata hook initialized successfully`);
      } catch (error) {
        console.error(`❌ [SETUP] Failed to initialize metadata hook:`, error);
      }

      // Enable Qase reporter plugin
      console.log(`\n📍 [SETUP] Initializing Qase reporter plugin...`);
      console.log(`   Token in process.env: ${process.env.QASE_API_TOKEN ? '✅ YES' : '❌ NO'}`);
      console.log(`   Token from qaseConfig: ${qaseConfig.token ? '✅ YES' : '❌ NO'}`);
      try {
        require('cypress-qase-reporter/plugin')(on, config);
        console.log(`✅ [SETUP] Qase reporter plugin initialized successfully`);
      } catch (error) {
        console.error(`❌ [SETUP] Failed to initialize reporter plugin:`, error);
      }

      console.log(`${'═'.repeat(80)}\n`);

      // Track before:run - tests about to start
      on('before:run', (details: any) => {
        console.log(`\n${'═'.repeat(80)}`);
        console.log(`📝 [BEFORE_RUN] Starting test run`);
        console.log(`   Specs to run: ${details.specs?.length || 'unknown'}`);
        if (details.specs) {
          details.specs.forEach((spec: any) => {
            console.log(`     - ${spec.name || spec.relative}`);
          });
        }
        console.log(`${'═'.repeat(80)}\n`);
      });

      // Track before each spec
      on('before:spec', (spec: any) => {
        console.log(`\n📄 [BEFORE_SPEC] Starting spec: ${spec.name}`);
        console.log(`   Relative path: ${spec.relative}`);
      });

      // Add after:spec hook to process and upload results (REQUIRED for test case reporting)
      on('after:spec', async (spec: any, results: any) => {
        try {
          console.log(`\n${'─'.repeat(80)}`);
          console.log(`📤 [AFTER_SPEC] Processing spec results: ${spec.name}`);
          console.log(`${'─'.repeat(80)}`);

          console.log(`   spec object keys: ${Object.keys(spec).join(', ')}`);
          console.log(`   results object keys: ${Object.keys(results || {}).join(', ')}`);

          // Get stats from results object (second parameter)
          if (results && results.stats) {
            console.log(`   Tests: ${results.stats.tests}`);
            console.log(`   Passing: ${results.stats.passes}`);
            console.log(`   Failing: ${results.stats.failures}`);
            console.log(`   Duration: ${results.stats.duration}ms`);
          } else if (spec.stats) {
            console.log(`   Tests: ${spec.stats.tests}`);
            console.log(`   Passing: ${spec.stats.passes}`);
            console.log(`   Failing: ${spec.stats.failures}`);
            console.log(`   Duration: ${spec.stats.duration}ms`);
          } else {
            console.warn(`   ⚠️  No stats available in either spec or results`);
            console.log(`   spec.stats: ${JSON.stringify(spec.stats)}`);
            console.log(`   results.stats: ${JSON.stringify(results?.stats)}`);
          }

          // Log test results details
          if (results && results.tests) {
            console.log(`\n   📋 Test Results:`);
            results.tests?.forEach((test: any, index: number) => {
              console.log(`      ${index + 1}. ${test.title} [${test.state || 'unknown'}]`);
              if (test.err) {
                console.log(`         Error: ${test.err.message}`);
              }
            });
          }

          // Prepare spec object with results data for afterSpecHook
          const specWithResults = {
            ...spec,
            stats: results?.stats || spec.stats,
            results: results?.tests ? { tests: results.tests } : spec.results,
          };

          console.log(`\n   Calling afterSpecHook with enriched spec...`);
          await afterSpecHook(specWithResults, config);
          console.log(`✅ [AFTER_SPEC] Spec results processed and queued for upload: ${spec.name}`);
          console.log(`${'─'.repeat(80)}\n`);
        } catch (error) {
          console.error(`❌ [AFTER_SPEC] Error processing spec results for ${spec.name}:`);
          console.error(error);
          // Continue processing even if upload fails
        }
      });

      // Add test completion tracking
      on('after:run', async (runResults: any) => {
        console.log(`\n${'═'.repeat(80)}`);
        console.log(`📊 [FINAL_RESULTS] Cypress run finished`);
        console.log(`${'═'.repeat(80)}`);
        console.log(`   Total specs run: ${runResults.stats?.specs || 'unknown'}`);
        console.log(`   Total tests: ${runResults.stats?.tests || 'unknown'}`);
        console.log(`   Passes: ${runResults.stats?.passes || 'unknown'}`);
        console.log(`   Failures: ${runResults.stats?.failures || 'unknown'}`);
        console.log(`   Duration: ${runResults.stats?.duration || 'unknown'}ms`);
        console.log(`${'═'.repeat(80)}\n`);
        console.log(`✅ [COMPLETION] All tests completed`);
      });

      return config;
    },
  },
});
