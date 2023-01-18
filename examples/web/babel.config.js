// @ts-check

module.exports = {
  // https://github.com/babel/babel/issues/12731#issuecomment-780153966
  sourceType: 'unambiguous',

  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',

        corejs: '3.26',

        debug: false
      }
    ],
    '@babel/preset-typescript'
  ]
};
