// @ts-check

/** @type {import('jest').Config} */
const config = {
  // By default Jest allows for __tests__/*.js, *.spec.js and *.test.js
  // https://jestjs.io/docs/en/26.5/configuration#testregex-string--arraystring
  // Let's be strict and use *.test.js only
  testRegex: '\\.test\\.ts$',

  // https://github.com/jestjs/jest/issues/4386#issuecomment-586028628
  randomize: true,

  testEnvironment: 'node',

  setupFilesAfterEnv: ['./jest.setup.ts'],

  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  }

  // https://github.com/facebook/jest/issues/9047
  // https://github.com/facebook/jest/issues/10419#issuecomment-731176514
  // clearMocks: true,
  // resetMocks: true,
  // restoreMocks: true
};

module.exports = config;
