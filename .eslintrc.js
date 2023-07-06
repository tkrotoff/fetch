// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {},
  // https://twitter.com/TkDodo/status/1667541777585258496
  reportUnusedDisableDirectives: true,
  extends: [
    // /!\ Order matters: the next one overrides rules from the previous one
    'plugin:playwright/playwright-test',
    'plugin:jest/recommended',
    'plugin:unicorn/recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['simple-import-sort'],
  env: {
    browser: true
  },

  rules: {
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    'spaced-comment': 'off',
    camelcase: 'off',

    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',

    'simple-import-sort/imports': [
      'error',
      {
        // https://github.com/lydell/eslint-plugin-simple-import-sort/blob/v7.0.0/src/imports.js#L5
        groups: [
          // Side effect imports
          ['^\\u0000'],

          // Packages
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter
          ['^@?\\w'],

          // Absolute imports and other imports such as Vue-style `@/foo`
          // Anything not matched in another group
          ['^'],

          // Relative imports
          [
            // https://github.com/lydell/eslint-plugin-simple-import-sort/issues/15

            // ../whatever/
            '^\\.\\./(?=.*/)',
            // ../
            '^\\.\\./',
            // ./whatever/
            '^\\./(?=.*/)',
            // Anything that starts with a dot
            '^\\.',
            // .html are not side effect imports
            '^.+\\.html$',
            // .scss/.css are not side effect imports
            '^.+\\.s?css$'
          ]
        ]
      }
    ],
    'simple-import-sort/exports': 'error',

    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',

    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/class-name-casing': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    'unicorn/filename-case': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/catch-error-name': 'off',
    'unicorn/prefer-query-selector': 'off',
    // FIXME Activate when ES modules are well supported
    'unicorn/prefer-module': 'off',

    'jest/no-restricted-matchers': 'error'
  },

  overrides: [
    {
      files: ['examples/**/*.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'unicorn/prefer-add-event-listener': 'off'
      }
    },
    {
      files: ['*.test.ts'],
      rules: {
        // Disable all Playwright rules if not *.test.e2e.ts
        // FIXME https://github.com/eslint/eslint/issues/3419
        'playwright/max-nested-describe': 'off',
        'playwright/missing-playwright-await': 'off',
        'playwright/no-conditional-in-test': 'off',
        'playwright/no-element-handle': 'off',
        'playwright/no-eval': 'off',
        'playwright/no-focused-test': 'off',
        'playwright/no-force-option': 'off',
        'playwright/no-page-pause': 'off',
        'playwright/no-restricted-matchers': 'off',
        'playwright/no-skipped-test': 'off',
        'playwright/no-useless-not': 'off',
        'playwright/no-wait-for-timeout': 'off',
        'playwright/prefer-lowercase-title': 'off',
        'playwright/prefer-strict-equal': 'off',
        'playwright/prefer-to-be': 'off',
        'playwright/prefer-to-have-length': 'off',
        'playwright/require-top-level-describe': 'off',
        'playwright/valid-expect': 'off'
      }
    }
  ]
};

module.exports = config;
