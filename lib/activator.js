var m = require('./index.js');
var path = require('path');
var fs = require('fs');
var util = require('attrs.util');

/**
 * mongodb activator for plexi
 * 
 * configuration (plexi.json)
 *	"plexi.mongodb": {
 *		instances: {
 *			"default": {
 *				"dbpath": ".mongo/data",
 *				"port": 27017
 *			},
 *			"another": {
 *				"version": "2.6.10",
 *				"dbpath": ".mongo/another",
 *				"bind_ip": "127.0.0.1",
 *				"logpath": ".mongo/another/logs/another.log",
 *				"port": 27018
 *			}
 *		}
 *	}
 *
 */
module.exports = {
	start: function(ctx) {
		var ws = ctx.workspace;		
		var pref = ctx.preference;
		
		// write default preference to plexi.json
		if( !pref ) {
			pref = ctx.application.preferences.set('plexi.mongodb', {
				"instances": {
					"default": {
						"dbpath": ".mongo/data",
						"port": 27017
					}
				}
			});
			ctx.application.preferences.save();
		}
		
		for(var k in pref.instances) {
			m.launch(pref.instances[k], function(err, ps) {
				if( err ) return util.error('mongodb', 'start up failure', err);				
				util.debug('mongodb', 'mongod started at ' + ps.options.port);
			});
		}
		
		return m;
	},
	stop: function(ctx) {
		m.stopAll();
	}
};