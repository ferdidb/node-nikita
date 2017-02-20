// Generated by CoffeeScript 1.11.1
var eco, nunjucks;

module.exports = function(string, options) {
  if (options.engine == null) {
    options.engine = 'nunjunks';
  }
  switch (options.engine) {
    case 'nunjunks':
      return (new nunjucks.Environment()).renderString(string, options);
    case 'eco':
      return eco.render(string, options);
    default:
      throw Error("Invalid engine: " + options.engine);
  }
};

eco = require('eco');

nunjucks = require('nunjucks/src/environment');