
# `ln` `link([goptions], options, callback)`

Create a symbolic link and it's parent directories if they don't yet
exist.

## Options

*   `source`   
    Referenced file to be linked.   
*   `destination`   
    Symbolic link to be created.   
*   `exec`   
    Create an executable file with an `exec` command.   
*   `mode`   
    Default to `0o0755`.   

## Callback parameters

*   `err`   
    Error object if any.   
*   `linked`   
    Number of created links.   

## Example

```js
require('mecano').link({
  source: __dirname,
  destination: '/tmp/a_link'
}, function(err, linked){
  console.log(err ? err.message : "Link created: " + !!linked);
});
```

    module.exports = (goptions, options, callback) ->
      [goptions, options, callback] = misc.args arguments
      result = child()
      finish = (err, created) ->
        callback err, created if callback
        result.end err, created
      misc.options options, (err, options) ->
        return finish err if err
        linked = 0
        sym_exists = (options, callback) ->
          fs.exists options.ssh, options.destination, (err, exists) ->
            return callback null, false unless exists
            fs.readlink options.ssh, options.destination, (err, resolvedPath) ->
              return callback err if err
              return callback null, true if resolvedPath is options.source
              fs.unlink options.ssh, options.destination, (err) ->
                return callback err if err
                callback null, false
        sym_create = (options, callback) ->
          fs.symlink options.ssh, options.source, options.destination, (err) ->
            return callback err if err
            linked++
            callback()
        exec_exists = (options, callback) ->
          fs.exists options.ssh, options.destination, (err, exists) ->
            return callback null, false unless exists
            fs.readFile options.ssh, options.destination, 'utf8', (err, content) ->
              return callback err if err
              exec_cmd = /exec (.*) \$@/.exec(content)[1]
              callback null, exec_cmd and exec_cmd is options.source
        exec_create = (options, callback) ->
          content = """
          #!/bin/bash
          exec #{options.source} $@
          """
          fs.writeFile options.ssh, options.destination, content, (err) ->
            return callback err if err
            fs.chmod options.ssh, options.destination, options.mode, (err) ->
              return callback err if err
              linked++
              callback()
        each( options )
        .parallel(goptions.parallel)
        .on 'item', (options, next) ->
          # return next new Error 'SSH not yet supported' if options.ssh
          return next new Error "Missing source, got #{JSON.stringify(options.source)}" unless options.source
          return next new Error "Missing destination, got #{JSON.stringify(options.destination)}" unless options.destination
          options.mode ?= 0o0755
          do_mkdir = ->
            mkdir
              ssh: options.ssh
              destination: path.dirname options.destination
            , (err, created) ->
              # It is possible to have collision if to symlink
              # have the same parent directory
              return callback err if err and err.code isnt 'EEXIST'
              do_dispatch()
          do_dispatch = ->
            if options.exec
              exec_exists options, (err, exists) ->
                return next() if exists
                exec_create options, next
            else
              sym_exists options, (err, exists) ->
                return next() if exists
                sym_create options, next
          do_mkdir()
        .on 'both', (err) ->
          callback err, linked
      result

## Dependencies

    fs = require 'ssh2-fs'
    path = require 'path'
    each = require 'each'
    misc = require './misc'
    conditions = require './misc/conditions'
    child = require './misc/child'
    mkdir = require './mkdir'



