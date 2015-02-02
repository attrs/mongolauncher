#!/usr/bin/env node

'use strict';

process.title = 'plexi.mongodb';

var Launcher = require('../src/Launcher.js');
process.on('SIGINT', function () {
	Launcher.stopAll();	
	process.exit();
});

var mongod = Launcher.create('default', process.argv.splice(2));
mongod.start(process.stdout);
mongod.console();

var c = require('chalk');
console.log(c.cyan('mongod started') + ' at ' + c.green('"' + mongod.argv.dbpath + '"'));