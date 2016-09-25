
# `mecano.connection.assert(options, [callback])`

Assert a TCP or HTTP server is listening.

## Source code

    module.exports = shy: true, handler: (options) ->
      options.log message: "Entering connection.assert", level: 'DEBUG', module: 'mecano/lib/connection/assert'
      @execute
        cmd: "echo > /dev/tcp/#{options.host}/#{options.port}"
      , (err) ->
        throw Error "Address not listening: \"#{options.host}:#{options.port}\"" if err