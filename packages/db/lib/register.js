// Generated by CoffeeScript 2.3.2
require('@nikita/core/lib/registry').register({
  db: {
    database: {
      '': '@nikita/db/lib/database',
      exists: '@nikita/db/lib/database/exists',
      remove: '@nikita/db/lib/database/remove',
      wait: '@nikita/db/lib/database/wait'
    },
    schema: {
      '': '@nikita/db/lib/schema',
      remove: '@nikita/db/lib/schema/remove'
    },
    user: {
      '': '@nikita/db/lib/user',
      exists: '@nikita/db/lib/user/exists',
      remove: '@nikita/db/lib/user/remove'
    }
  }
});