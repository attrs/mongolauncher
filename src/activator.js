var Starter = require('./Starter.js');

module.exports = {
	start: function(ctx) {
		var options = ctx.preference;
		
		var out = options.console !== false ? console : null;
		
		Starter.create('default', options).start(out);
		
		console.log('* mongodb started', options);
	},
	stop: function(ctx) {
		Starter.stopAll();
		console.log('* mongodb stopped');
	}
};