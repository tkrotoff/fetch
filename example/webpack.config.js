// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path');

/** @type import('webpack').Configuration */
const config = {
  entry: './index.ts',

  output: {
    path: join(__dirname, 'build'),
    filename: '[name].js'
  },

  resolve: {
    extensions: ['.js', '.ts']
  },

  module: {
    rules: [
      {
        test: /\.(js|ts)$/,

        // [Babel should not transpile core-js](https://github.com/zloirock/core-js/issues/514#issuecomment-476533317)
        exclude: /\/core-js/,

        loader: 'babel-loader'
      },
      { test: /\.html$/, loader: 'file-loader', options: { name: '[path][name].[ext]' } }
    ]
  }
};

module.exports = config;
