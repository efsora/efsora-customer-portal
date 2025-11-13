import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';
import { afterSpecHook } from 'cypress-qase-reporter/hooks';

// Load environment variables from .env.local with absolute path
const envPath = path.resolve(__dirname, '.env.local');
console.log(`Loading environment variables from: ${envPath}`);
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.warn(`Warning: Could not load .env.local: ${envResult.error.message}`);
} else {
  console.log(`Successfully loaded .env.local with ${Object.keys(envResult.parsed || {}).length} variables`);
}

// Log loaded variables (for debugging)
console.log(`QASE_API_TOKEN: ${process.env.QASE_API_TOKEN ? 'SET' : 'NOT SET'}`);
console.log(`QASE_PROJECT: ${process.env.QASE_PROJECT || 'NOT SET'}`);
console.log(`QASE_PROJECT_CODE: ${process.env.QASE_PROJECT_CODE || 'NOT SET'}`);


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
            token: process.env.QASE_API_TOKEN || ''
          },
          project: process.env.QASE_PROJECT || 'ECP',
          uploadAttachments: true,
          autocreate: true,
          run: {
            complete: true
          }
        },
        framework: {
          cypress: {
            screenshotsFolder: 'cypress/screenshots',
            videosFolder: 'cypress/videos',
            uploadDelay: 10
          }
        }
      }
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

      // Update reporter options with current environment variables
      if (config.reporterOptions && config.reporterOptions.cypressQaseReporterReporterOptions) {
        const qaseConfig = config.reporterOptions.cypressQaseReporterReporterOptions;
        if (qaseConfig.testops) {
          qaseConfig.testops.api = {
            token: process.env.QASE_API_TOKEN || '',
          };
          qaseConfig.testops.project = process.env.QASE_PROJECT || 'ECP';
          console.log(`Qase reporter configured - Token: ${process.env.QASE_API_TOKEN ? 'SET' : 'NOT SET'}, Project: ${process.env.QASE_PROJECT || 'ECP'}`);
        }
      }

      // Enable Qase reporter plugin
      require('cypress-qase-reporter/plugin')(on, config);

      // Add metadata collection hook (REQUIRED for qase() decorators to work)
      require('cypress-qase-reporter/metadata')(on);

      // Add after:spec hook to process results (REQUIRED for test case reporting)
      on('after:spec', async (spec, results) => {
        await afterSpecHook(spec, config);
      });

      return config;
    },
  },
});
