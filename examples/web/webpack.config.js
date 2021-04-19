// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/** @type import('webpack').Configuration */
const config = {
  entry: './index.ts',

  output: {
    path: path.join(__dirname, 'build')
  },

  resolve: {
    extensions: ['.js', '.ts']
  },

  module: {
    rules: [
      { test: /\.ts$/, loader: 'babel-loader' },
      { test: /\.html$/, type: 'asset/resource', generator: { filename: '[name][ext]' } }
    ]
  }
};

module.exports = config;
