// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaults } = require('jest-config');

module.exports = {
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, 'dist']
};
