// Generated by CoffeeScript 1.10.0
var db;

module.exports = function(options) {
  var k, ref, v;
  if (options.db == null) {
    options.db = {};
  }
  ref = options.db;
  for (k in ref) {
    v = ref[k];
    if (options[k] == null) {
      options[k] = v;
    }
  }
  if (options.username == null) {
    options.username = options.argument;
  }
  return this.execute({
    cmd: db.cmd(options, "DROP USER IF EXISTS " + options.username + ";")
  });
};

db = require('../../misc/db');