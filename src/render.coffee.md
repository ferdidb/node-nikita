
# `render([goptions], options, callback)`

Render a template file. The following templating engines are
integrated. More are added on demand.      

*   [ECO](http://github.com/sstephenson/eco) (default)   
*   [Nunjucks](http://mozilla.github.io/nunjucks/) ("*.j2")   

## Options

*   `engine`   
    Template engine to use, default to "eco".   
*   `content`   
    Templated content, bypassed if source is provided.   
*   `source`   
    File path where to extract content from.   
*   `destination`   
    File path where to write content to or a callback.   
*   `context`   
    Map of key values to inject into the template.   
*   `local_source`   
    Treat the source as local instead of remote, only apply with "ssh"
    option.   
*   `skip_empty_lines`   
    Remove empty lines.   
*   `uid`   
    File user name or user id.   
*   `gid`   
    File group name or group id.   
*   `mode`   
    File mode (permission and sticky bits), default to `0666`, in the for of
    `{mode: 0o744}` or `{mode: "744"}`.   

If destination is a callback, it will be called with the generated content as
its first argument.   

## Callback parameters

*   `err`   
    Error object if any.   
*   `rendered`   
    Number of rendered files.   

## Rendering with Nunjucks

```js
require('mecano').render({
  source: './some/a_template.j2',
  destination: '/tmp/a_file',
  context: {
    username: 'a_user'
  }
}, function(err, rendered){
  console.log(err ? err.message : "File rendered: " + !!rendered);
});
```

    module.exports = (goptions, options, callback) ->
      [goptions, options, callback] = misc.args arguments
      misc.options options, (err, options) ->
        return callback err if err
        rendered = 0
        each( options )
        .parallel(goptions.parallel)
        .on 'item', (options, next) ->
          # Validate parameters
          return next new Error 'Missing source or content' unless options.source or options.content
          return next new Error 'Missing destination' unless options.destination
          # Start real work
          do_read_source = ->
            return do_write() unless options.source
            ssh = if options.local_source then null else options.ssh
            fs.exists ssh, options.source, (err, exists) ->
              return next new Error "Invalid source, got #{JSON.stringify(options.source)}" unless exists
              fs.readFile ssh, options.source, 'utf8', (err, content) ->
                return next err if err
                options.content = content
                do_write()
          do_write = ->
            if not options.engine and options.source
              extension = path.extname options.source
              options.engine = 'nunjunks' if extension is '.j2'
            options.source = null
            write options, (err, written) ->
              return next err if err
              rendered++ if written
              next()
          conditions.all options, next, do_read_source
        .on 'both', (err) ->
          callback err, rendered

## Dependencies

    fs = require 'ssh2-fs'
    path = require 'path'
    each = require 'each'
    misc = require './misc'
    conditions = require './misc/conditions'
    child = require './misc/child'
    write = require './write'





