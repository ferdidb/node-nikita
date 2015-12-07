
# `docker_build(options, callback)`

Return the checksum of repository:tag, if it exists. Function not native to docker.

## Options

*   `repository` (string)
    Name of the repository. MANDATORY
*   `machine` (string)
    Name of the docker-machine. MANDATORY if using docker-machine
*   `code`   (int|array)
    Expected code(s) returned by the command, int or array of int, default to 0.
*   `code_skipped`
    Expected code(s) returned by the command if it has no effect, executed will
    not be incremented, int or array of int.
*   `cwd` (string)
    change the working directory for the build.
*   `log`
    Function called with a log related messages.
*   `ssh` (object|ssh2)
    Run the action on a remote server using SSH, an ssh2 instance or an
    configuration object used to initialize the SSH connection.
*   `tag` (string)
    Tag of the repository. Default to latest
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
*   `checksum`
    The repository's cheskum if it exists or null if it doesn't



## Source Code

    module.exports = (options, callback) ->
      # Validate parameters and madatory conditions
      return callback Error 'Missing repository parameter' unless options.repository?
      options.tag ?= 'latest'
      cmd = " images | grep '#{options.repository}' | grep '#{options.tag}' | awk ' { print $3 }'"
      options.log message: "Getting repository cheksum :#{options.repository}", level: 'INFO', module: 'mecano/src/docker/checksum'
      docker.exec cmd, options, true, (err, executed, stdout, stderr, cheksum) =>
        options.log message: "Image does not exist :#{options.repository}", level: 'INFO', module: 'mecano/src/docker/checksum' unless executed
        checksum = if stdout == '' then false else stdout.toString().trim()
        options.log message: "Image found : #{options.repository} with checksum: #{checksum}", level: 'INFO', module: 'mecano/src/docker/checksum' if executed
        return callback err, executed, stdout, stderr, checksum


## Modules Dependencies

    docker = require '../misc/docker'