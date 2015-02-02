var Launcher = require('./Launcher.js');
var path = require('path');
var fs = require('fs');

module.exports = {
	start: function(ctx) {
		var options = ctx.preference;
		var ws = ctx.workspace;
		
		var create = function(name, config) {
			config.dbpath = config.dbpath || ws.mkdir(k + '/data');
			config.logpath = config.logpath || path.resolve(config.dbpath, '../' + k + '.log');
			
			var out = config.console ? process.stdout : null;
			Launcher.create(k, config).start(out);
			console.log('* mongodb[' + k + ':' + (config.port || '(27017)') + '] started "' + config.dbpath + '"');
		};
		
		var instances = options.instances;
		for(var k in instances) {
			create(k, instances[k]);
		}
				
		return {
			create: function(name, config) {
				return create(name, config);
			},
			remove: function(name) {
				return Launcher.remove(name);
			},
			names: function() {
				return Launcher.names();
			},
			get: function(name) {
				return Launcher.get(name);
			},
			stop: function(name) {
				var p = Launcher.get(name);
				if( p ) return p.stop();
			},
			Launcher: Launcher
		};
	},
	stop: function(ctx) {
		Launcher.stopAll();
		console.log('* mongodb stopped');
	}
};