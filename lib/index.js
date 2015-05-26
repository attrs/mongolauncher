var launcher = require('./launcher.js');
var installer = require('./installer.js');
var client = require('./client.js');
var util = require('attrs.util');

module.exports = {
	ensureInstall: installer.ensureInstall,
	launch: launcher.launch,
	get: launcher.get,
	all: launcher.all,
	stop: launcher.stop,
	stopAll: launcher.stopAll,
	client: client,
	
	// notification deprecated for 0.1.x user
	create: function(name, options) {
		util.error('mongodb', '\'create\' function was deprecated since plexi.mongodb@0.2. use \'launch\' function refer to https://github.com/attrs/plexi.mongodb');
	}
};
