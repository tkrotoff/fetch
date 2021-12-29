import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testMatch: /.*\.test\.e2e\.ts$/,

  use: {
    headless: true,

    // Because the certificate is self-signed
    ignoreHTTPSErrors: true
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: devices['Desktop Chrome']
    },
    {
      name: 'Desktop Firefox',
      use: devices['Desktop Firefox']
    },
    {
      name: 'Desktop Safari',
      use: devices['Desktop Safari']
    }
  ]
};

export default config;
