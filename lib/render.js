// Generated by CoffeeScript 1.7.1
var child, conditions, each, fs, misc, path, write;

module.exports = function(goptions, options, callback) {
  var _ref;
  _ref = misc.args(arguments), goptions = _ref[0], options = _ref[1], callback = _ref[2];
  return misc.options(options, function(err, options) {
    var rendered;
    if (err) {
      return callback(err);
    }
    rendered = 0;
    return each(options).parallel(goptions.parallel).on('item', function(options, next) {
      var do_read_source, do_write;
      if (!(options.source || options.content)) {
        return next(new Error('Missing source or content'));
      }
      if (!options.destination) {
        return next(new Error('Missing destination'));
      }
      do_read_source = function() {
        var ssh;
        if (!options.source) {
          return do_write();
        }
        ssh = options.local_source ? null : options.ssh;
        return fs.exists(ssh, options.source, function(err, exists) {
          if (!exists) {
            return next(new Error("Invalid source, got " + (JSON.stringify(options.source))));
          }
          return fs.readFile(ssh, options.source, 'utf8', function(err, content) {
            if (err) {
              return next(err);
            }
            options.content = content;
            return do_write();
          });
        });
      };
      do_write = function() {
        var extension;
        if (!options.engine && options.source) {
          extension = path.extname(options.source);
          if (extension === '.j2') {
            options.engine = 'nunjunks';
          }
        }
        options.source = null;
        return write(options, function(err, written) {
          if (err) {
            return next(err);
          }
          if (written) {
            rendered++;
          }
          return next();
        });
      };
      return conditions.all(options, next, do_read_source);
    }).on('both', function(err) {
      return callback(err, rendered);
    });
  });
};

fs = require('ssh2-fs');

path = require('path');

each = require('each');

misc = require('./misc');

conditions = require('./misc/conditions');

child = require('./misc/child');

write = require('./write');