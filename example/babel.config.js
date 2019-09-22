// @ts-check

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // Cannot use 'usage' otherwise IE 10 fails with "'Set' is undefined"
        useBuiltIns: 'entry',

        // See https://babeljs.io/blog/2019/03/19/7.4.0#core-js-3-7646-https-githubcom-babel-babel-pull-7646
        corejs: 3,

        debug: false

        // See https://github.com/facebook/create-react-app/pull/3776/files#diff-e4eb38a3161bed144100754a3e97763dR43
        // modules: false
      }
    ],
    '@babel/preset-typescript'
  ]
};
