var Starter = require('./Starter.js');

process.on('SIGINT', function () {
	Starter.stopAll();	
	process.exit();
});

module.exports = Starter;