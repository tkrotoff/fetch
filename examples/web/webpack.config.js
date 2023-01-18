// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('node:path');

/** @type import('webpack').Configuration */
const config = {
  entry: './index.ts',

  output: {
    path: path.join(__dirname, 'build'),
    clean: true
  },

  devtool: 'inline-source-map',

  resolve: {
    extensions: ['.js', '.ts']
  },

  module: {
    rules: [
      {
        test: /\.(js|ts)$/,

        // [Babel should not transpile core-js](https://github.com/zloirock/core-js/issues/514#issuecomment-476533317)
        exclude: /node_modules\/core-js/,

        loader: 'babel-loader'
      },
      { test: /\.html$/, type: 'asset/resource', generator: { filename: '[name][ext]' } }
    ]
  }
};

module.exports = config;
