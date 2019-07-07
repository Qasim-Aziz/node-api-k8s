global.Promise = require('bluebird');

require('@babel/register')({
  extends: './.babelrc',
  ignore: [/node_modules/],
  extensions: ['.js', '.ts'],
});

const server = require('./server');

if (require.main === module) {
  server.listen();
}

exports = server.default;
