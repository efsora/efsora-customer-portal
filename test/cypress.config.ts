import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';

try {
  require('dotenv').config();
} catch (e) {
  // dotenv might not be available in all environments
}

export default defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, cypress-qase-reporter',
    cypressQaseReporterReporterOptions: {
      // Defaults to "testops" if QASE_MODE is not set
      mode: process.env.QASE_MODE || 'testops',
      debug: false,
      testops: {
        api: {
          token: process.env.QASE_TOKEN,
        },
        project: process.env.QASE_PROJECT,
        uploadAttachments: true,
        create:true,
        run: {
          autoCreate: true, // 👈 create run automatically in Qase
          complete: true,   // 👈 mark run complete after tests finish
          title: 'Automated Test Run',

        },
      },
      framework: {
        cypress: {
          screenshotsFolder: 'cypress/screenshots',
        },
      },
    },
  },
  video: false,
  e2e: {
    // Environment variables take precedence, fallback to localhost for local development
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5174',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
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
    env: {
      // Environment variables take precedence, fallback to localhost for local development
      apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:3000/api/v1',
    },
    setupNodeEvents(on, config) {
      const environment = config.env.environment || 'dev';
      const configFile = path.join(__dirname, 'cypress', 'config', `${environment}.json`);

      if (fs.existsSync(configFile)) {
        const envConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

        // Merge priority: CLI env vars > config file > defaults
        // Only override if not already set by environment variables
        if (!process.env.CYPRESS_BASE_URL && envConfig.baseUrl) {
          config.baseUrl = envConfig.baseUrl;
        }

        config.env = {
          ...config.env,
          ...envConfig,
          // Ensure apiUrl from env var takes precedence
          apiUrl: process.env.CYPRESS_API_URL || envConfig.apiUrl || config.env.apiUrl
        };

        console.log(`Loaded ${environment} environment configuration`);
      } else {
        console.warn(`Config file not found: ${configFile}, using default configuration`);
      }

      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);

      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
});
