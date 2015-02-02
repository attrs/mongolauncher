var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

var MongoConsole = {
	connect: function(options) {
		var command = path.resolve(__dirname, '..', 'mongodb/bin/mongo');
		var self = this;
		
		for( var k in options ) {
			var value = options[k] || '';
			command += ' --' + k + (value ? (' ' + value) : '');
		}
		
		var child = exec(command, {
			encoding: 'utf8'
		});
		
		child.stdin.setEncoding = 'utf-8';
		child.stdout.pipe(process.stdout);
		
		process.stdin.resume();
		process.stdout.write('> ');		
		process.stdin.removeAllListeners('data');
		process.stdin.on('data', function(text) {
			try {
				child.stdin.write(text + '\n');
				setTimeout(function() {
					if( self.process ) process.stdout.write('> ');				
				},30);
			} catch(err) {
			}
		});		
		process.on('exit', function(code) {
			self.disconnect();
		});
		process.on('uncaughtException', function(err) {
			console.log('MongoConsole error: ' + err);
		});
		
		this.process = child;
		return this;
	},
	disconnect: function() {
		if( this.process ) {
			this.process.kill('SIGHUP');
			this.process = null;
			process.stdin.removeAllListeners('data');
			process.stdin.pause();
			console.log('mongo console stopped');
		}
		return this;
	}
}

module.exports = MongoConsole;