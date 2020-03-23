// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaults } = require('jest-config');

/** @type Partial<import('@jest/types').Config.InitialOptions> */
const config = {
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, 'dist'],

  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  }
};

module.exports = config;
