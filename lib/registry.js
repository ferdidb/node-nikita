// Generated by CoffeeScript 1.10.0
var merge;

module.exports = {};

Object.defineProperty(module.exports, 'get', {
  configurable: true,
  enumerable: false,
  get: function() {
    return function(name) {
      var cnames, i, j, len, n;
      if (typeof name === 'string') {
        name = [name];
      }
      cnames = module.exports;
      for (i = j = 0, len = name.length; j < len; i = ++j) {
        n = name[i];
        if (!cnames[n]) {
          return null;
        }
        if (cnames[n] && cnames[n][''] && i === name.length - 1) {
          return cnames[n][''];
        }
        cnames = cnames[n];
      }
      return null;
    };
  }
});

Object.defineProperty(module.exports, 'register', {
  configurable: true,
  enumerable: false,
  get: function() {
    return function(name, handler) {
      var cleanup, cnames, j, n, name1, names, ref;
      if (typeof name === 'string') {
        name = [name];
      }
      if (Array.isArray(name)) {
        cnames = names = module.exports;
        for (n = j = 0, ref = name.length - 1; 0 <= ref ? j < ref : j > ref; n = 0 <= ref ? ++j : --j) {
          n = name[n];
          if (cnames[n] == null) {
            cnames[n] = {};
          }
          cnames = cnames[n];
        }
        if (cnames[name1 = name[name.length - 1]] == null) {
          cnames[name1] = {};
        }
        cnames[name[name.length - 1]][''] = handler;
        return merge(module.exports, names);
      } else {
        cleanup = function(obj) {
          var k, results, v;
          results = [];
          for (k in obj) {
            v = obj[k];
            if (typeof v === 'string') {
              v = require.main.require(v);
            }
            if (v && typeof v === 'object' && !Array.isArray(v) && !v.handler) {
              results.push(cleanup(v));
            } else {
              if (k !== '') {
                results.push(obj[k] = {
                  '': v
                });
              } else {
                results.push(void 0);
              }
            }
          }
          return results;
        };
        cleanup(name);
        return merge(module.exports, name);
      }
    };
  }
});

Object.defineProperty(module.exports, 'registered', {
  configurable: true,
  enumerable: false,
  get: function() {
    return function(name) {
      var cnames, i, j, len, n;
      if (typeof name === 'string') {
        name = [name];
      }
      cnames = module.exports;
      for (i = j = 0, len = name.length; j < len; i = ++j) {
        n = name[i];
        if (!cnames[n]) {
          return false;
        }
        if (cnames[n][''] && i === name.length - 1) {
          return true;
        }
        cnames = cnames[n];
      }
      return false;
    };
  }
});

Object.defineProperty(module.exports, 'unregister', {
  configurable: true,
  enumerable: false,
  get: function() {
    return function(name) {
      var cnames, i, j, len, n;
      if (typeof name === 'string') {
        name = [name];
      }
      cnames = module.exports;
      for (i = j = 0, len = name.length; j < len; i = ++j) {
        n = name[i];
        if (i === name.length - 1) {
          delete cnames[n];
        }
        cnames = cnames[n];
        if (!cnames) {
          return;
        }
      }
    };
  }
});

merge = require('./misc').merge;