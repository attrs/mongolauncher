var Starter = require('./Starter.js');
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
			Starter.create(k, config).start(out);
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
				return Starter.remove(name);
			},
			names: function() {
				return Starter.names();
			},
			get: function(name) {
				return Starter.get(name);
			},
			stop: function(name) {
				var p = Starter.get(name);
				if( p ) return p.stop();
			},
			Starter: Starter
		};
	},
	stop: function(ctx) {
		Starter.stopAll();
		console.log('* mongodb stopped');
	}
};