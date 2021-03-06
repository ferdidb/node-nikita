// Generated by CoffeeScript 2.3.2
// # `nikita.log.md`

// Write log to the host filesystem in Markdown.

// ## Options

// * `archive` (boolean)   
//   Save a copy of the previous logs inside a dedicated directory, default is
//   "false".   
// * `basedir` (string)    
//   Directory where to store logs relative to the process working directory.
//   Default to the "log" directory. Note, if the "archive" option is activated
//   log file will be stored accessible from "./log/latest".   
// * `filename` (string)   
//   Name of the log file, contextually rendered with all options passed to
//   the mustache templating engine. Default to "{{shortname}}.log", where 
//   "shortname" is the ssh host or localhost.   

// Global options can be alternatively set with the "log_md" property.

// ## Source Code
var log_fs;

module.exports = {
  ssh: false,
  handler: function({options}) {
    var k, ref, stdouting, v;
    // Obtains options from "log_md" namespace
    if (options.log_md == null) {
      options.log_md = {};
    }
    ref = options.log_md;
    for (k in ref) {
      v = ref[k];
      options[k] = v;
    }
    // Normalize
    if (options.divider == null) {
      options.divider = ' : ';
    }
    // State
    stdouting = 0;
    return this.call(options, log_fs, {
      serializer: {
        'diff': function(log) {
          if (!log.message) {
            return `\n\`\`\`diff\n${log.message}\`\`\`\n\n`;
          }
        },
        'end': function() {
          return '\nFINISHED WITH SUCCESS\n';
        },
        'error': function(err) {
          var content, error, i, len, print, ref1;
          content = [];
          content.push('\nFINISHED WITH ERROR\n');
          print = function(err) {
            return content.push(err.stack || err.message + '\n');
          };
          if (!err.errors) {
            print(err);
          } else if (err.errors) {
            content.push(err.message + '\n');
            ref1 = err.errors;
            for (i = 0, len = ref1.length; i < len; i++) {
              error = ref1[i];
              content.push(error);
            }
          }
          return content.join('');
        },
        'header': function(log) {
          var header;
          header = log.headers.join(options.divider);
          return `\n${'#'.repeat(log.headers.length)} ${header}\n\n`;
        },
        'stdin': function(log) {
          var out;
          out = [];
          if (log.message.indexOf('\n') === -1) {
            out.push(`\nRunning Command: \`${log.message}\`\n\n`);
          } else {
            out.push(`\n\`\`\`stdin\n${log.message}\n\`\`\`\n\n`);
          }
          // stdining = log.message isnt null
          return out.join('');
        },
        'stderr': function(log) {
          return `\n\`\`\`stderr\n${log.message}\`\`\`\n\n`;
        },
        'stdout_stream': function(log) {
          var out;
          // return if log.message is null and stdouting is 0
          if (log.message === null) {
            stdouting = 0;
          } else {
            stdouting++;
          }
          out = [];
          if (stdouting === 1) {
            out.push('\n```stdout\n');
          }
          if (stdouting > 0) {
            out.push(log.message);
          }
          if (stdouting === 0) {
            out.push('\n```\n\n');
          }
          return out.join('');
        },
        'text': function(log) {
          var content;
          content = [];
          content.push(`${log.message}`);
          if (log.module) {
            content.push(` (${log.depth}.${log.level}, written by ${log.module})`);
          }
          content.push("\n");
          return content.join('');
        }
      }
    });
  }
};

// ## Dependencies
log_fs = require('./fs');
