
mecano = require '../../src'
misc = require '../../src/misc'
test = require '../test'
they = require 'ssh2-they'
fs = require 'ssh2-fs'

describe 'file.assert', ->

  scratch = test.scratch @
  
  describe 'exists', ->

    they 'file doesnt not exist', (ssh, next) ->
      mecano
        ssh: ssh
      .file.assert "#{scratch}/a_file"
      .then (err) ->
        err.message.should.eql "File does not exists: \"#{scratch}/a_file\""
        next()

    they 'file exists', (ssh, next) ->
      mecano
        ssh: ssh
      .file.touch "#{scratch}/a_file"
      .file.assert "#{scratch}/a_file"
      .then next

    they 'with option not', (ssh, next) ->
      mecano
        ssh: ssh
      .file.assert "#{scratch}/a_file", not: true
      .file.touch "#{scratch}/a_file"
      .file.assert "#{scratch}/a_file", not: true, relax: true, (err) ->
        err.message.should.eql "File exists: \"#{scratch}/a_file\""
      .then next

    they 'requires target', (ssh, next) ->
      mecano
        ssh: ssh
      .file.assert
        content: "are u here"
      .then (err) ->
        err.message.should.eql 'Missing option: "target"'
        next()
  
  describe 'content', ->

    they 'content match', (ssh, next) ->
      mecano
        ssh: ssh
      .file
        target: "#{scratch}/a_file"
        content: "are u here"
      .file.assert
        target: "#{scratch}/a_file"
        content: "are u here"
      .then next

    they 'option source is alias of target', (ssh, next) ->
      mecano
        ssh: ssh
      .file
        target: "#{scratch}/a_file"
        content: "are u here"
      .file.assert
        source: "#{scratch}/a_file"
        content: "are u here"
      .then next

    they 'content dont match', (ssh, next) ->
      mecano
        ssh: ssh
      .file
        target: "#{scratch}/a_file"
        content: "are u here"
      .file.assert
        target: "#{scratch}/a_file"
        content: "are u sure"
      .then (err) ->
        err.message.should.eql 'Invalid content match: expect "are u sure" and got "are u here"'
        next()

    they 'with option not', (ssh, next) ->
      mecano
        ssh: ssh
      .file
        target: "#{scratch}/a_file"
        content: "are u here"
      .file.assert
        target: "#{scratch}/a_file"
        content: "are u sure"
        not: true
      .file.assert
        target: "#{scratch}/a_file"
        content: "are u here"
        relax: true
        not: true
      , (err) ->
        err.message.should.eql 'Unexpected content match: "are u here"'
      .then next

    they 'send custom error message', (ssh, next) ->
      mecano
        ssh: ssh
      .file
        target: "#{scratch}/a_file"
        content: "are u here"
      .file.assert
        target: "#{scratch}/a_file"
        content: "are u sure"
        error: 'Got it'
      .then (err) ->
        err.message.should.eql "Got it"
        next()
  
  describe 'option md5', ->
    
    they 'detect if file does not exists', (ssh, next) ->
      mecano
        ssh: ssh
      .file.assert
        target: "#{scratch}/a_file"
        md5: 'toto'
        relax: true
      , (err) ->
        err.message.should.eql "Target does not exists: #{scratch}/a_file"
      .then next
    
    they 'validate hash', (ssh, next) ->
      mecano
        ssh: ssh
      .file.assert
        target: "#{scratch}/a_file"
        md5: 'toto'
        relax: true
      , (err) ->
        err.message.should.eql "Target does not exists: #{scratch}/a_file"
      .file
        target: "#{scratch}/a_file"
        content: "are u here"
      .file.assert
        target: "#{scratch}/a_file"
        md5: "invalidmd5signature"
        relax: true
      , (err) ->
        err.message.should.eql "Invalid md5 signature: expect \"invalidmd5signature\" and got \"f0a1e0f2412f62cc97178fd6b44dc978\""
      .file.assert
        target: "#{scratch}/a_file"
        md5: "f0a1e0f2412f62cc97178fd6b44dc978"
      .then next

    they 'with option not', (ssh, next) ->
      mecano
        ssh: ssh
      .file
        target: "#{scratch}/a_file"
        content: "are u here"
      .file.assert
        target: "#{scratch}/a_file"
        md5: 'toto'
        not: true
      .file.assert
        target: "#{scratch}/a_file"
        md5: "f0a1e0f2412f62cc97178fd6b44dc978"
        not: true
        relax: true
      , (err) ->
        err.message.should.eql "Matching md5 signature: \"f0a1e0f2412f62cc97178fd6b44dc978\""
      .then next

  describe 'option sha1', ->
    
    they 'validate hash', (ssh, next) ->
      mecano
        ssh: ssh
      .file.assert
        target: "#{scratch}/a_file"
        sha1: 'toto'
        relax: true
      , (err) ->
        err.message.should.eql "Target does not exists: #{scratch}/a_file"
      .file
        target: "#{scratch}/a_file"
        content: "are u here"
      .file.assert
        target: "#{scratch}/a_file"
        sha1: "invalidmd5signature"
        relax: true
      , (err) ->
        err.message.should.eql "Invalid sha1 signature: expect \"invalidmd5signature\" and got \"94d1f318f02816c590bd65595c28df1dd7ff326b\""
      .file.assert
        target: "#{scratch}/a_file"
        sha1: "94d1f318f02816c590bd65595c28df1dd7ff326b"
      .then next

  describe 'option mode', ->
    
    they 'detect if file does not exists', (ssh, next) ->
      mecano
        ssh: ssh
      .file.assert
        target: "#{scratch}/a_file"
        mode: 0o755
        relax: true
      , (err) ->
        err.message.should.eql "Target does not exists: #{scratch}/a_file"
      .then next
          
    they 'on file', (ssh, next) ->
      mecano
        ssh: ssh
      .file.touch
        target: "#{scratch}/a_file"
        mode: 0o0755
      .file.assert
        target: "#{scratch}/a_file"
        mode: 0o0644
        relax: true
      , (err) ->
        err.message.should.eql "Invalid mode: expect 0644 and got 0755"
      .file.assert
        target: "#{scratch}/a_file"
        mode: 0o0755
      .then next

    they 'on directory', (ssh, next) ->
      mecano
        ssh: ssh
      .system.mkdir
        target: "#{scratch}/a_file"
        content: "are u here"
        mode: 0o0755
      .file.assert
        target: "#{scratch}/a_file"
        mode: 0o0644
        relax: true
      , (err) ->
        err.message.should.eql "Invalid mode: expect 0644 and got 0755"
      .file.assert
        target: "#{scratch}/a_file"
        mode: 0o0755
      .then next

    they 'with option not', (ssh, next) ->
      mecano
        ssh: ssh
      .file.touch
        target: "#{scratch}/a_file"
        mode: 0o0755
      .file.assert
        target: "#{scratch}/a_file"
        mode: 0o0644
        not: true
      .file.assert
        target: "#{scratch}/a_file"
        mode: 0o0755
        not: true
        relax: true
      , (err) ->
        err.message.should.eql "Unexpected valid mode: 0755"
      .then next
      
    
