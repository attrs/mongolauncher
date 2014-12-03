var Starter = require('./Starter.js');

var argv = process.argv.splice(2);

var mongod = Starter.create('default', argv);
mongod.start(console);
