// @ts-check

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {},
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['prettier', '@typescript-eslint'],
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true
  },

  rules: {
    'prettier/prettier': 'error',

    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/class-name-casing': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off'
  }
};
