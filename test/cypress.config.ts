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
        mode: 'testops',
        debug: true,
        testops: {
          api: {
            token: qaseConfig.token,
          },
          project: qaseConfig.project,
          uploadAttachments: true,
          autocreate: true,
          run: qaseConfig.runId
            ? { id: qaseConfig.runId, complete: false }
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
      console.log(`\n📍 Initializing Qase metadata collection hook...`);
      require('cypress-qase-reporter/metadata')(on);
      console.log(`✅ Qase metadata hook initialized\n`);

      // Enable Qase reporter plugin
      console.log(`📍 Initializing Qase reporter plugin...`);
      require('cypress-qase-reporter/plugin')(on, config);
      console.log(`✅ Qase reporter plugin initialized\n`);

      // Add after:spec hook to process and upload results (REQUIRED for test case reporting)
      on('after:spec', async (spec: any) => {
        try {
          console.log(`\n📤 Processing spec results: ${spec.name}`);
          console.log(`   Total tests in spec: ${spec.stats.tests}`);
          await afterSpecHook(spec, config);
          console.log(`✅ Spec results processed and queued for upload: ${spec.name}\n`);
        } catch (error) {
          console.error(`❌ Error processing spec results for ${spec.name}:`, error);
          // Continue processing even if upload fails
        }
      });

      // Add test completion tracking
      on('after:run', async () => {
        console.log(`✅ All tests completed - Qase run is being completed...`);
      });

      return config;
    },
  },
});
