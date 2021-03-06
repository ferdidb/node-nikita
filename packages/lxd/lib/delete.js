// Generated by CoffeeScript 2.3.2
// # `nikita.lxd.delete`

// Delete a Linux Container using lxd.

// ## Options

// * `name` (required, string)
//   The name of the container
// * `force` (optional default: false)
//   If true, the container will be deleted even if running

// ## Example

// ```
// require('nikita')
// .lxd.delete({
//   name: "myubuntu"
// }, function(err, {status}) {
//   console.log( err ? err.message : 'The container was deleted')
// });
// ```

// ## Source Code
module.exports = function({options}) {
  this.log({
    message: "Entering delete",
    level: 'DEBUG',
    module: '@nikitajs/lxd/lib/delete'
  });
  if (!options.name) {
    //Check args
    throw Error("Invalid Option: name is required");
  }
  // Execution
  return this.system.execute({
    cmd: `lxc info ${options.name} > /dev/null || exit 42\n${['lxc', 'delete', options.name, options.force ? "--force" : void 0].join(' ')}`,
    code_skipped: 42
  });
};
