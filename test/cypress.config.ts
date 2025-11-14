import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
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
      cypressQaseReporterReporterOptions: {
        mode: 'testops',
        debug: true,
        testops: {
          api: {
            token: process.env.QASE_TESTOPS_API_TOKEN,
          },
          project: process.env.QASE_TESTOPS_PROJECT || 'ECP',
          uploadAttachments: true,
          run: {
            complete: true,
          },
          autocreate: true,
        },
        framework: {
          cypress: {
            screenshotsFolder: 'cypress/screenshots',
            videosFolder: 'cypress/videos',
            uploadDelay: 10,
          },
        },
      },
    },
    env: {
      apiUrl: 'http://localhost:3000/api',
    },
    setupNodeEvents(on, config) {
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

      // Register Qase reporter plugin
      require('cypress-qase-reporter/plugin')(on, config);

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
