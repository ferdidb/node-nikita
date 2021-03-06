// Generated by CoffeeScript 2.4.0
// # resolved.coffee.md

// * `rootdir` (string)
//   Path to the mount point corresponding to the root directory, optional.
// * `content` (array)
//   Fields that accepts space-separated values should be passed as array if they
//   contains more than one element. Runs `systemctl daemon-reload && systemctl
//   restart systemd-resolved` by default if target was modified.
// * `reload` (boolean, optional, null)
//   Defaults to true. If set to true the following command will be executed
//   `systemctl daemon-reload && systemctl restart systemd-resolved` after having
//   wrote the configuration file.
// * `target` (string)
//   File to write, defaults to "/usr/lib/systemd/resolved.conf.d/resolved.conf".
// * `merge` (boolean, optional, null)
//   Defaults to false. If set to true, the content of `target` wont be overridden
//   but merged with `content`.

// ## Example

// ```javascript
// nikita = require("nikita")

// nikita.file.types.systemd.resolved({
//   target: "/etc/systemd/resolved.conf",
//   rootdir: "/mnt",
//   content:
//     FallbackDNS: ["1.1.1.1", "9.9.9.10", "8.8.8.8", "2606:4700:4700::1111"]
//     ReadEtcHosts: true
// })

// nikita.file.types.systemd.resolved({
//   content:
//     DNS: "ns0.fdn.fr"
//     DNSSEC: "allow-downgrade"
//   merge: true
// })
// ```
var path;

module.exports = function({options}) {
  this.log({
    message: "Entering file.types.resolved",
    level: "DEBUG",
    module: "nikita/lib/file/types/systemd"
  });
  // Options
  if (options.target == null) {
    options.target = "/usr/lib/systemd/resolved.conf.d/resolved.conf";
  }
  if (options.rootdir) {
    options.target = `${path.join(options.rootdir, options.target)}`;
  }
  if (options.generate == null) {
    options.generate = null;
  }
  if (Array.isArray(options.content.DNS)) {
    options.content.DNS = options.content.DNS.join(" ");
  }
  if (Array.isArray(options.content.FallbackDNS)) {
    options.content.FallbackDNS = options.content.FallbackDNS.join(" ");
  }
  if (Array.isArray(options.content.Domains)) {
    options.content.Domains = options.content.Domains.join(" ");
  }
  options.content = {
    Resolve: options.content
  };
  // Write configuration
  this.file.ini({
    separator: "=",
    target: options.target,
    content: options.content,
    merge: options.merge
  });
  return this.system.execute({
    if: function() {
      if (options.reload != null) {
        return options.reload;
      } else {
        return this.status(-1);
      }
    },
    sudo: true,
    cmd: "systemctl daemon-reload\nsystemctl restart systemd-resolved",
    trap: true
  });
};

// ## Dependencies
path = require("path");
