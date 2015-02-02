#!/usr/bin/env node

'use strict';

var argv = require('attrs.argv');
var pkg = require('../package.json');
var Launcher = require('../src/Launcher.js');
var MongoConsole = require('../src/MongoConsole.js');

process.title = pkg.name;

process.on('SIGINT', function () {
	Launcher.stopAll();
	MongoConsole.disconnect();
	process.exit();
});

var mongod = Launcher.create('default', process.argv.splice(2));
mongod.start(process.stdout);

if( argv.console !== false ) {
	MongoConsole.connect({
		port: argv.port,
		host: argv.host || '127.0.0.1'
	});
}

var c = require('chalk');
console.log(c.cyan('mongod started') + ' at ' + c.green('"' + mongod.argv.dbpath + '"'));