#!/usr/bin/env node

'use strict';

var argv = require('attrs.argv');
var pkg = require('../package.json');
var m = require('../');
var chalk = require('chalk');
var path = require('path');
var wrench = require('wrench');
var osenv = require('osenv');

process.title = pkg.name;

if( !argv.dbpath ) {
	argv.dbpath = path.resolve(osenv.home(), '.mongodb', 'default');
}
wrench.mkdirSyncRecursive(argv.dbpath);

m.launch(argv, function(err, ps) {
	if( err ) return console.error(chalk.red(err));
	console.log('mongodb started [%s]', ps.pid);
	console.log(chalk.cyan('mongod started') + ' at ' + (ps.options.port || '27017'));
	console.log(chalk.green('└── dbpath is "' + ps.options.dbpath + '"'));
});

/*if( argv.console !== false ) {
	m.console.connect({
		port: argv.port || 27017,
		host: argv.host || '127.0.0.1'
	});
}*/
