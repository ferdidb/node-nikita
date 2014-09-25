
# `krb5_ktadd([goptions], options, callback`

Create and manage a keytab. This function is usually not used directly but instead
called by the `krb5_addprinc` function.   

## Options

*   `kadmin_server`   
    Address of the kadmin server; optional, use "kadmin.local" if missing.   
*   `kadmin_principal`   
    KAdmin principal name unless `kadmin.local` is used.   
*   `kadmin_password`   
    Password associated to the KAdmin principal.   
*   `principal`   
    Principal to be created.   
*   `keytab`   
    Path to the file storing key entries.   
*   `ssh`   
    Run the action on a remote server using SSH, an ssh2 instance or an
    configuration object used to initialize the SSH connection.   
*   `log`   
    Function called with a log related messages.   
*   `stdout`   
    Writable Stream in which commands output will be piped.   
*   `stderr`   
    Writable Stream in which commands error will be piped.   

## Example

```
require('mecano').krb5_delrinc({
  principal: 'myservice/my.fqdn@MY.REALM',
  keytab: '/etc/security/keytabs/my.service.keytab',
  kadmin_principal: 'me/admin@MY_REALM',
  kadmin_password: 'pass',
  kadmin_server: 'localhost'
}, function(err, removed){
  console.log(err ? err.message : "Principal removed: " + !!removed);
});
```

    module.exports = (goptions, options, callback) ->
      [goptions, options, callback] = misc.args arguments
      misc.options options, (err, options) ->
        return callback err if err
        executed = 0
        each(options)
        .parallel( goptions.parallel )
        .on 'item', (options, next) ->
          return next new Error 'Property principal is required' unless options.principal
          return next new Error 'Property keytab is required' unless options.keytab
          # options.realm ?= options.principal.split('@')[1] # Break cross-realm principals
          options.realm ?= options.kadmin_principal.split('@')[1] if /.*@.*/.test options.kadmin_principal
          modified = false
          do_get = ->
            return do_end() unless options.keytab
            execute
              cmd: "klist -kt #{options.keytab}"
              ssh: options.ssh
              log: options.log
              stdout: options.stdout
              stderr: options.stderr
              code_skipped: 1
            , (err, exists, stdout, stderr) ->
              return next err if err
              return do_ktadd() unless exists
              keytab = {}
              for line in stdout.split '\n'
                if match = /^\s*(\d+)\s+([\d\/:]+\s+[\d\/:]+)\s+(.*)\s*$/.exec line
                  [_, kvno, mdate, principal] = match
                  kvno = parseInt kvno, 10
                  mdate = Date.parse "#{mdate} GMT"
                  # keytab[principal] ?= {kvno: null, mdate: null}
                  if not keytab[principal] or keytab[principal].kvno < kvno
                    keytab[principal] = kvno: kvno, mdate: mdate
              # Principal is not listed inside the keytab
              return do_ktadd() unless keytab[options.principal]?
              execute
                cmd: misc.kadmin options, "getprinc -terse #{options.principal}"
                ssh: options.ssh
                log: options.log
                stdout: options.stdout
                stderr: options.stderr
              , (err, exists, stdout, stderr) ->
                return err if err
                # return do_ktadd() unless -1 is stdout.indexOf 'does not exist'
                values = stdout.split('\n')[1]
                # Check if a ticket exists for this
                return next Error "Principal does not exist: '#{options.principal}'" unless values
                values = values.split '\t'
                mdate = parseInt(values[2], 10) * 1000
                kvno = parseInt values[8], 10
                options.log? "Mecano `krb5_ktadd`: keytab kvno '#{keytab[principal]?.kvno}', principal kvno '#{kvno}'"
                options.log? "Mecano `krb5_ktadd`: keytab mdate '#{new Date keytab[principal]?.mdate}', principal mdate '#{new Date mdate}'"
                return do_chown() if keytab[principal]?.kvno is kvno and keytab[principal].mdate is mdate
                do_ktremove()
          do_ktremove = ->
            execute
              cmd: misc.kadmin options, "ktremove -k #{options.keytab} #{options.principal}"
              ssh: options.ssh
              log: options.log
              stdout: options.stdout
              stderr: options.stderr
            , (err, exists, stdout, stderr) ->
              return next err if err
              do_ktadd()
          do_ktadd = ->
            execute
              cmd: misc.kadmin options, "ktadd -k #{options.keytab} #{options.principal}"
              ssh: options.ssh
              log: options.log
              stdout: options.stdout
              stderr: options.stderr
            , (err, ktadded) ->
              return next err if err
              modified = true
              do_chown()
          do_chown = () ->
            return do_chmod() if not options.keytab or (not options.uid and not options.gid)
            chown
              ssh: options.ssh
              log: options.log
              destination: options.keytab
              uid: options.uid
              gid: options.gid
            , (err, chowned) ->
              return next err if err
              modified = chowned if chowned
              do_chmod()
          do_chmod = () ->
            return do_end() if not options.keytab or not options.mode
            chmod
              ssh: options.ssh
              log: options.log
              destination: options.keytab
              mode: options.mode
            , (err, chmoded) ->
              return next err if err
              modified = chmoded if chmoded
              do_end()
          do_end = ->
            executed++ if modified
            next()
          conditions.all options, next, do_get
        .on 'both', (err) ->
          callback err, executed

## Fields in 'getprinc -terse' output

princ-canonical-name
princ-exp-time
last-pw-change
pw-exp-time
princ-max-life
modifying-princ-canonical-name
princ-mod-date
princ-attributes <=== This is the field you want
princ-kvno
princ-mkvno
princ-policy (or 'None')
princ-max-renewable-life
princ-last-success
princ-last-failed
princ-fail-auth-count
princ-n-key-data
ver
kvno
data-type[0]
data-type[1]

## Dependencies

    each = require 'each'
    misc = require './misc'
    conditions = require './misc/conditions'
    child = require './misc/child'
    execute = require './execute'
    chmod = require './chmod'
    chown = require './chown'

