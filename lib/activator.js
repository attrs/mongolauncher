var Launcher = require('./Launcher.js');
var path = require('path');
var fs = require('fs');

module.exports = {
	start: function(ctx) {
		var pref = ctx.preference || {};
		var ws = ctx.workspace;
		
		var create = function(name, config) {
			if( Launcher.get(name) ) return console.error('already exist name', name);
			config.dbpath = config.dbpath || ws.mkdir(name + '/data');
			config.logpath = config.logpath || path.resolve(config.dbpath, '../' + name + '.log');
						
			var out = config.console ? process.stdout : null;
			Launcher.create(name, config).start(out);
		};
		
		var instances = pref.instances;
		for(var k in instances) {
			create(k, instances[k]);
		}
		
		if( !instances ) {
			create('default', {});
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
	}
};