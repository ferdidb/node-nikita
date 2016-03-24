
# `docker_exec(options, callback)`

Run a command in a running container

## Options

*   `container` (string)
    Name/ID of the container. MANDATORY
*   `machine` (string)
    Name of the docker-machine. MANDATORY if using docker-machine
*   `service` (boolean)
    if true, run container as a service. Else run as a command. true by default
*   `uid` (name | uid)
    Username or uid
*   `gid` (name | gid)
    Groupname or gid
*   `code` (int|array)
    Expected code(s) returned by the command, int or array of int, default to 0.
*   `code_skipped`
    Expected code(s) returned by the command if it has no effect, executed will
    not be incremented, int or array of int.
*   `log`
    Function called with a log related messages.
*   `ssh` (object|ssh2)
    Run the action on a remote server using SSH, an ssh2 instance or an
    configuration object used to initialize the SSH connection.
*   `stdout` (stream.Writable)
    Writable EventEmitter in which the standard output of executed commands will
    be piped.
*   `stderr` (stream.Writable)
    Writable EventEmitter in which the standard error output of executed command
    will be piped.


## Callback parameters

*   `err`
    Error object if any.
*   `executed`
    if command was executed
*   `stdout`
    Stdout value(s) unless `stdout` option is provided.
*   `stderr`
    Stderr value(s) unless `stderr` option is provided.

## Example

```javascript
mecano.docker({
  ssh: ssh
  container: 'myContainer'
  cmd: '/bin/bash -c "echo toto"'
}, function(err, is_true, stdout, stderr){
  if(err){
    console.log(err.message);
  }else if(is_true){
    console.log('OK!');
  }else{
    console.log('Ooops!');
  }
})
```

## Source Code

    module.exports = (options, callback) ->
      # Validate parameters
      options.docker ?= {}
      options[k] ?= v for k, v of options.docker
      throw Error 'Missing container' unless options.container?
      throw Error 'Missing cmd' unless options.cmd?
      options.service ?= false
      # Construct exec command
      cmd = 'exec'
      if options.uid?
        cmd += " -u #{options.uid}"
        cmd += ":#{options.gid}" if options.gid?
      else if options.gid?
        options.log message: 'options.gid ignored unless options.uid is provided', level: 'WARN', module: 'mecano/lib/docker/exec'
      cmd += " #{options.container} #{options.cmd}"
      delete options.cmd
      @execute
        cmd: docker.wrap options, cmd
      # Note: There is no way to pass additionnal arguments in sync mode without
      # a callback, or we would have ', docker.callback' as next line
      , ->
        try
          docker.callback.call null, arguments...
        catch e then arguments[0] = e
        callback arguments...

## Modules Dependencies

    docker = require '../misc/docker'