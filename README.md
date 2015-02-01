# plexi.mongodb

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image-flat]][travis-url]
[![Gratipay][gratipay-image]][gratipay-url]

Automatically install & launch MongoDB.

### Examples
#### Programmatically Launch
##### Installation
```sh
$ npm install plexi.mongodb --save
```

##### package usage
```js
var MongoStarter = require('plexi.mongodb');

var mongod = MongoStarter.create('mydb', {
	// use default logfile
	log: true,			
	// port
	port: 20991,		
	// datafile path, default is node_modules/plexi.mongodb/data/(mydb)
	dbpath: 'somedir',	
	// logfile path, default(must be log:true) is node_modules/plexi.mongodb/logs/(mydb).log
	logpath: 'somefile.log'	
}).start(process.stdout);

// able to launch multiple mongodb instance (watch the port conflict)
var mongod2 = MongoStarter.create('db2', {log:true, port: 20992}).start(console);
var mongod3 = MongoStarter.create('db3').start();

// stop mongod instance
mongod.stop();
mongod2.stop();
MongoStarter.stopAll();
```

##### extra attrs/methods
```js
// current mongod process names
var names = MongoStarter.names();

// current mongod processes
var processes = MongoStarter.processes();

// get mongod process by name
var p = MongoStarter.get('mydb');

// get child process
var ps = mongod.child;

// mongod process cwd
console.log(mongod.cwd);

// exec command
console.log(mongod.command);

// process connect status(boolean)
console.log(mongod.connected);

// process pid
console.log(mongod.pid());
```

#### Install the executable

"pmongo" cli arguments is same as original "mongod" options.

##### windows
```sh
> npm install -g plexi.mongodb

> pmongo
or
> pmongo --port <port> --dbpath "some/dir" --logpath "some/dir/mongodb.log"
```

##### osx/linux
```sh
$ sudo npm install -g plexi.mongodb

$ sudo pmongo
or
$ sudo pmongo --port <port> --dbpath "some/dir" --logpath "some/dir/mongodb.log"
```

### License

  [MIT](LICENSE)
  

 [npm-image]: https://img.shields.io/npm/v/plexi.mongodb.svg?style=flat
 [npm-url]: https://npmjs.org/package/plexi.mongodb
 [downloads-image]: https://img.shields.io/npm/dm/plexi.mongodb.svg?style=flat
 [downloads-url]: https://npmjs.org/package/plexi.mongodb
 [travis-image-flat]: https://img.shields.io/travis/attrs/plexi.mongodb.svg?style=flat
 [travis-image]: https://travis-ci.org/attrs/plexi.mongodb.svg?branch=master
 [travis-url]: https://travis-ci.org/attrs/plexi.mongodb
 [gratipay-image]: https://img.shields.io/gratipay/teamattrs.svg?style=flat
 [gratipay-url]: https://gratipay.com/teamattrs/