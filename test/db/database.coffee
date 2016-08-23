
mecano = require '../../src'
db = require '../../src/misc/db'
test = require '../test'
they = require 'ssh2-they'
each = require 'each'

config = test.config()
for engine, _ of config.db

  describe "db.database #{engine}", ->

    they 'add new database', (ssh, next) ->
      mecano
        ssh: ssh
        db: config.db[engine]
      .db.database.remove 'postgres_db_0'
      .db.database
        database: 'postgres_db_0'
      .db.database.remove 'postgres_db_0'
      .then next
      
    they 'status not modified new database', (ssh, next) ->
      mecano
        ssh: ssh
        db: config.db[engine]
      .db.database.remove 'postgres_db_1'
      .db.database
        database: 'postgres_db_1'
      .db.database
        database: 'postgres_db_1'
      , (err, status) ->
        status.should.be.false() unless err
      .db.database.remove 'postgres_db_1'
      .then next

    they 'add new database and add existing user to it', (ssh, next) ->
      mecano
        ssh: ssh
        db: config.db[engine]
      .db.database.remove 'postgres_db_3'
      .db.user.remove 'postgres_user_3'
      .db.user
        username: 'postgres_user_3'
        password: 'postgres_user_3'
      .db.database
        database: 'postgres_db_3'
        user: 'postgres_user_3'
      .execute
        cmd: switch engine
          when 'mysql' then db.cmd(config.db[engine], database: 'mysql', "SELECT user FROM db WHERE db='postgres_db_3';") + " | grep 'postgres_user_3'"
          when 'postgres' then db.cmd(config.db[engine], database: 'postgres_db_3', '\\l') + " | egrep '^postgres_user_3='"
      , (err, status) ->
        status.should.be.true() unless err
      .db.database.remove
        database: 'postgres_db_3'
        always: true
      .db.user.remove
        username: "postgres_user_3"
        always: true
      .then next

    they 'add new database and add not-existing user to it', (ssh, next) ->
      mecano
        ssh: ssh
        db: config.db[engine]
      .db.database.remove 'postgres_db_4'
      .db.user.remove 'postgres_user_4'
      .db.database
        database: 'postgres_db_4'
        user: 'postgres_user_4'
      .execute
        cmd: switch engine
          when 'mysql' then db.cmd(config.db[engine], database: 'mysql', "SELECT user FROM db WHERE db='postgres_db_4';") + " | grep 'postgres_user_3'"
          when 'postgres' then db.cmd(config.db[engine], database: 'postgres_db_4', '\\l') + " | egrep '^postgres_user_4='"
        code_skipped: 1
      , (err, status) ->
        status.should.be.false() unless err
      .db.database.remove
        database: 'postgres_db_4'
        always: true
      .db.user.remove
        username: "postgres_user_4"
        always: true
      .then next
