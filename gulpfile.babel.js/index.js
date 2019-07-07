require('@babel/register')({
  extends: './.babelrc',
  ignore: [/node_modules/],
  extensions: ['.js', '.ts'],
  sourceMaps: true
});

global.Promise = require('bluebird');

require('./tasks');
