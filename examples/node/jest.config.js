// @ts-check

// [How to set transformIgnorePatterns to fix "Jest encountered an unexpected token"](https://github.com/nrwl/nx/issues/812)
const esModules = ['node-fetch', 'data-uri-to-buffer', 'fetch-blob', 'formdata-polyfill'];

/** @type import('@jest/types').Config.InitialOptions */
const config = {
  testEnvironment: 'node',

  setupFilesAfterEnv: ['./jest.setup.ts'],

  // By default Jest allows for __tests__/*.js, *.spec.js and *.test.js
  // https://jestjs.io/docs/en/26.5/configuration#testregex-string--arraystring
  // Let's be strict and use *.test.js only
  testRegex: '\\.test\\.ts$',

  transformIgnorePatterns: [`/node_modules/(?!${esModules.join('|')})`],

  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  }
};

export default config;
