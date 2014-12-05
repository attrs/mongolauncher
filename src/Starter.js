var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;
var base = path.resolve(__dirname, '..', 'mongodb');

// class Mongod
function Mongod(name, options) {
	if( !name || typeof(name) !== 'string' ) throw new Error('illegal name:' + name);
	
	var cwd = path.resolve(__dirname, '..');
	var executable = path.resolve(__dirname, '..', 'mongodb/bin/mongod');
	var command = executable;
	options = options || {};
		
	var argv = [];
	
	if( Array.isArray(options) ) {
		argv = options;
		command = command + ' ' + argv.join(' ');
	} else if( typeof(options) === 'object' ) {
		for(var k in options) {
			if( k === 'log' ) continue;
			
			var name = k;
			if( name[0] !== '-' ) name = '--' + name;
			
			var value = options[k];
			if( value !== 0 && !value ) {
				continue;
			} else if( value === true ) {
				argv.push(name);
			} else {
				argv.push(name);
				argv.push('\"' + value + '\"');
			}
		}
		
		command = command + ' ' + argv.join(' ');
	} else if( typeof(options) === 'string' ) {
		command = command + ' ' + options;
	} else {
		throw new Error('unsupported type of options', options);
	}
	
	if( !~command.indexOf('--dbpath') ) {
		var dbpath = path.resolve(process.cwd(), '.mongodb', name);
		mkdirp.sync(dbpath);
		command += ' --dbpath "' + dbpath + '"';
	}
	
	options.log = true;
	
	if( options.log && !~command.indexOf('--logpath') ) {
		var logpath = path.resolve(process.cwd(), '.mongodb', 'logs');
		mkdirp.sync(logpath);
		command += ' --logpath "' + path.resolve(logpath, name + '.log') + '"';
	}

	this.name = name;
	this.cwd = cwd;
	this.executable = executable;
	this.argv = argv;
	this.command = command;
};

Mongod.prototype = {
	start: function(monitor) {
		if( typeof(monitor) ===  'function' ) monitor = {log:monitor};
			
		var child = exec(this.command, {
			encoding: 'utf8',
			cwd: this.cwd
		});
		var self = this;
		
		child.stdout.setEncoding('utf8');
		child.stderr.setEncoding('utf8');
		
		child.stdout.on('data', function(data) {
			if( monitor && monitor.log ) monitor.log(data);
		});
		
		child.stderr.on('data', function (data) {
			if( monitor && monitor.error ) monitor.error(data);
		});
	
		this.child = child;	
		return this;
	},
	pid: function() {
		return this.child.pid;	
	},
	connected: function() {
		return this.child.connected;	
	},
	stop: function() {
		var code = -1;
		if( this.child ) {
			code = this.child.kill('SIGHUP');
			console.log('[' + this.name + '] mongod stopped [' + this.command + ']');
		}
		return code;
	}
}

var processes = {};
module.exports = {
	names: function() {
		var arr = [];
		for(var k in processes) arr.push(k);
		return arr;
	},
	get: function(name) {
		return processes[name];
	},
	processes: function() {
		var arg = [];
		for(var k in processes) {
			var mongod = processes[k];
			if( mongod instanceof Mongod ) arr.push(mogod);
		}
		return arg;	
	},
	stopAll: function() {
		for(var k in processes) {
			var mongod = processes[k];
			if( mongod instanceof Mongod ) mongod.stop();
		}
	},
	mongod: function(name) {
		return processes[name];	
	},
	create: function(name, options) {
		if( processes[name] ) throw new Error('already exists:' + name);
		var mongod = new Mongod(name, options);
			
		processes[name] = mongod;
		return mongod;
	}
};