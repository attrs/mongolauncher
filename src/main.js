var Launcher = require('./Launcher.js');

process.on('SIGINT', function () {
	Launcher.stopAll();	
	process.exit();
});

module.exports = Launcher;