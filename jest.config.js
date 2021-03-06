// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaults } = require('jest-config');

/** @type Partial<import('@jest/types').Config.InitialOptions> */
const config = {
  setupFilesAfterEnv: ['./jest.setup.ts'],

  // By default Jest allows for __tests__/*.js, *.spec.js and *.test.js
  // https://jestjs.io/docs/en/26.5/configuration#testregex-string--arraystring
  // Let's be strict and use *.test.js only
  testRegex: '\\.test\\.ts$',

  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, '/examples/'],

  // This randomizes test files
  // FIXME It does not solve the real issue: [Ability to run tests within a file in a random order](https://github.com/facebook/jest/issues/4386)
  testSequencer: './JestRandomSequencer.js',

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
