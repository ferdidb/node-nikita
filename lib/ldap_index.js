// Generated by CoffeeScript 1.7.1
var child, conditions, each, ldap, misc;

module.exports = function(goptions, options, callback) {
  var finish, result, _ref;
  _ref = misc.args(arguments), goptions = _ref[0], options = _ref[1], callback = _ref[2];
  result = child();
  finish = function(err, created) {
    if (callback) {
      callback(err, created);
    }
    return result.end(err, created);
  };
  misc.options(options, function(err, options) {
    var modified;
    if (err) {
      return finish(err);
    }
    modified = 0;
    return each(options).parallel(goptions.parallel).on('item', function(options, next) {
      var client, connect, do_diff, end, get, parse, replace, stringifiy, unbind, updated;
      client = null;
      updated = false;
      connect = function() {
        var _ref1, _ref2, _ref3;
        if (((_ref1 = options.ldap) != null ? (_ref2 = _ref1.url) != null ? (_ref3 = _ref2.protocol) != null ? _ref3.indexOf('ldap') : void 0 : void 0 : void 0) === 0) {
          client = options.ldap;
          return get();
        }
        client = ldap.createClient({
          url: options.url
        });
        return client.bind(options.binddn, options.passwd, function(err) {
          if (err) {
            return end(err);
          }
          return get();
        });
      };
      get = function() {
        return client.search('olcDatabase={2}bdb,cn=config', {
          scope: 'base',
          attributes: ['olcDbIndex']
        }, function(err, search) {
          var olcDbIndex;
          olcDbIndex = null;
          search.on('searchEntry', function(entry) {
            return olcDbIndex = entry.object.olcDbIndex;
          });
          return search.on('end', function() {
            return parse(olcDbIndex);
          });
        });
      };
      parse = function(arIndex) {
        var index, indexes, k, v, _i, _len, _ref1;
        indexes = {};
        for (_i = 0, _len = arIndex.length; _i < _len; _i++) {
          index = arIndex[_i];
          _ref1 = index.split(' '), k = _ref1[0], v = _ref1[1];
          indexes[k] = v;
        }
        return do_diff(indexes);
      };
      do_diff = function(orgp) {
        var i, newp, nkl, okl, _i, _ref1;
        if (!options.overwrite) {
          newp = misc.merge({}, orgp, options.indexes);
        } else {
          newp = options.indexes;
        }
        okl = Object.keys(orgp).sort();
        nkl = Object.keys(newp).sort();
        for (i = _i = 0, _ref1 = Math.min(okl.length, nkl.length); 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          if (i === okl.length || i === nkl.length || okl[i] !== nkl[i] || orgp[okl[i]] !== newp[nkl[i]]) {
            updated = true;
            break;
          }
        }
        if (updated) {
          return stringifiy(newp);
        } else {
          return unbind();
        }
      };
      stringifiy = function(perms) {
        var indexes, k, v;
        indexes = [];
        for (k in perms) {
          v = perms[k];
          indexes.push("" + k + " " + v);
        }
        return replace(indexes);
      };
      replace = function(indexes) {
        var change;
        change = new ldap.Change({
          operation: 'replace',
          modification: {
            olcDbIndex: indexes
          }
        });
        return client.modify(options.name, change, function(err) {
          return unbind(err);
        });
      };
      unbind = function(err) {
        var _ref1, _ref2, _ref3;
        if (((_ref1 = options.ldap) != null ? (_ref2 = _ref1.url) != null ? (_ref3 = _ref2.protocol) != null ? _ref3.indexOf('ldap') : void 0 : void 0 : void 0) === 0 && !options.unbind) {
          return end(err);
        }
        return client.unbind(function(e) {
          if (e) {
            return next(e);
          }
          return end(err);
        });
      };
      end = function(err) {
        if (updated && !err) {
          modified += 1;
        }
        return next(err);
      };
      return conditions.all(options, next, connect);
    }).on('both', function(err) {
      return finish(err, modified);
    });
  });
  return result;
};

each = require('each');

ldap = require('ldapjs');

misc = require('./misc');

conditions = require('./misc/conditions');

child = require('./misc/child');