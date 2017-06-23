var launcher = require('./launcher.js');
var installer = require('./installer.js');
var client = require('./client.js');

module.exports = {
  ensureInstall: installer.ensureInstall,
  launch: launcher.launch,
  get: launcher.get,
  port: launcher.port,
  all: launcher.all,
  stopAll: launcher.stopAll,
  client: client
};
