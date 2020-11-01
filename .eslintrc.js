// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {},
  extends: [
    // /!\ Order matters: the next one overrides rules from the previous one
    'plugin:jest/recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint'
  ],
  plugins: ['simple-import-sort'],
  env: {
    browser: true
  },

  rules: {
    'no-underscore-dangle': 'off',
    camelcase: 'off',

    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',

    'simple-import-sort/sort': [
      'error',
      {
        // https://github.com/lydell/eslint-plugin-simple-import-sort/blob/v5.0.2/src/sort.js#L3-L15
        groups: [
          // Side effect imports
          ['^\\u0000'],

          // Packages
          [
            // React first
            '^react$',
            // Things that start with a letter (or digit or underscore), or `@` followed by a letter
            '^@?\\w'
          ],

          // Absolute imports and other imports such as Vue-style `@/foo`
          // Anything that does not start with a dot
          ['^[^.]'],

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

    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',

    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/class-name-casing': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    'jest/no-expect-resolves': 'error'
  },

  overrides: [
    {
      files: ['example/*.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    }
  ]
};

module.exports = config;
