const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    chromeWebSecurity: false,
    video: false,
    screenshotOnRunFailure: true,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/json',
      overwrite: false,
      html: false,
      json: true,
      timestamp: 'mmddyyyy_HHMMss',
    },
    retries: {
      runMode: 1,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      on('before:run', () => {
        const fs = require('fs');
        const reportDir = 'cypress/reports';
        if (fs.existsSync(reportDir)) {
          fs.rmSync(reportDir, { recursive: true });
        }
      });
      return config;
    },
  },
  env: {
    STANDARD_USER: process.env.STANDARD_USER || 'standard_user',
    LOCKED_OUT_USER: process.env.LOCKED_OUT_USER || 'locked_out_user',
    PROBLEM_USER: process.env.PROBLEM_USER || 'problem_user',
    PERFORMANCE_USER: process.env.PERFORMANCE_USER || 'performance_glitch_user',
    ERROR_USER: process.env.ERROR_USER || 'error_user',
    PASSWORD: process.env.PASSWORD || 'secret_sauce',
  },
});
