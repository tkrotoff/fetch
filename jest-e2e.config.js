// @ts-check

/** @type import('@jest/types').Config.InitialOptions */
const config = {
  preset: 'jest-playwright-preset',
  testEnvironmentOptions: {
    'jest-playwright': {
      browsers: ['chromium', 'firefox', 'webkit'],
      // launchOptions: {
      //   devtools: true,
      //   slowMo: 100 // Slow down by 100ms
      // },
      contextOptions: {
        // Because the certificate is self-signed
        ignoreHTTPSErrors: true
      }
    }
  },

  testRegex: '\\.test\\.e2e\\.ts$'
};

module.exports = config;
