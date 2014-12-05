var Starter = require('./Starter.js');
var path = require('path');
var fs = require('fs');

module.exports = {
	start: function(ctx) {
		var options = ctx.preference;
		var workbench = ctx.workbench;
		
		var out = options.console !== false ? console : null;		
		
		
		return {
			create: function(name, argv) {
				var argv = options.argv = options.argv || {};
				if( !argv['dbpath'] ) argv['dbpath'] = workbench.mkdir('datafile');
				if( !argv['logpath'] ) argv['logpath'] = workbench.mkdir('default.log');
		
				Starter.create('default', argv).start(out);
				console.log('* mongodb started', options);
			},
			get: function(name) {
				
			},
			stop: function(name) {
				
			},
			Starter: Starter
		};
	},
	stop: function(ctx) {
		Starter.stopAll();
		console.log('* mongodb stopped');
	}
};