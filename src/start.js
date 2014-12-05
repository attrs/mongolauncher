var Starter = require('./Starter.js');

process.on('SIGINT', function () {
	Starter.stopAll();	
	process.exit();
});

Starter.create('default', process.argv.splice(2)).start(console);

