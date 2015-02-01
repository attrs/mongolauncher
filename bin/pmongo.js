#!/usr/bin/env node

'use strict';

process.title = 'plexi.mongodb';

var Starter = require('../src/Starter.js');
process.on('SIGINT', function () {
	Starter.stopAll();	
	process.exit();
});

var mongod = Starter.create('default', process.argv.splice(2));
mongod.start(process.stdout);
mongod.console();

var c = require('chalk');
console.log(c.cyan('mongod started') + ' at ' + c.green('"' + mongod.argv.dbpath + '"'));