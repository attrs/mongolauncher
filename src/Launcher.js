var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;

// class Launcher
function Launcher(name, options) {
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

Launcher.prototype = {
	start: function(monitor) {
		if( typeof(monitor) === 'function' ) monitor = {write:monitor};
		
		//console.log(this.command);
		var child = exec(this.command, {
			encoding: 'utf8',
			cwd: this.cwd
		});
		
		child.stdout.setEncoding('utf8');
		child.stderr.setEncoding('utf8');
		
		child.stdout.on('data', function(data) {
			if( monitor && monitor.write ) monitor.write(data);
		});
		
		child.stderr.on('data', function (data) {
			if( monitor && monitor.write ) monitor.write(data);
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
			this.child = null;
			console.log('[' + this.name + '] process stopped(' + code + ') [' + this.command + ']');
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
			var launcher = processes[k];
			if( launcher instanceof Launcher ) arr.push(launcher);
		}
		return arg;	
	},
	stopAll: function() {
		for(var k in processes) {
			var launcher = processes[k];
			if( launcher instanceof Launcher ) launcher.stop();
		}
	},
	create: function(name, options) {
		if( processes[name] ) throw new Error('already exists:' + name);
		var launcher = new Launcher(name, options);
			
		processes[name] = launcher;
		return launcher;
	},
	remove: function(name) {
		var launcher = this.get(name);
		if( launcher ) {
			launcher.stop();
			processes[name] = null;
			delete processes[name];
			return launcher;
		}
		return false;
	}
};