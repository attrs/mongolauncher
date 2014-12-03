# plexi.mongodb

Automatically install & launch MongoDB.

### Examples
#### Programmatically Launch
##### Installation
```sh
$ npm install plexi.mongodb --save
```

##### package usage
```js
var pmongo = require('plexi.mongodb');

var mongod = pmongo.create('mydb', {
	// use default logfile
	log: true,			
	// port
	port: 20991,		
	// datafile path, default is node_modules/plexi.mongodb/data/(mydb)
	dbpath: 'somedir',	
	// logfile path, default(must be log:true) is node_modules/plexi.mongodb/logs/(mydb).log
	logpath: 'somefile.log'	
}).start(console);

// able to launch multiple mongodb instance (watch the port conflict)
var mongod2 = pmongo.create('db2', {log:true, port: 20992}).start(console);
var mongod3 = pmongo.create('db3').start();

// stop mongod instance
mongod.stop();
mongod2.stop();
```

##### extra attrs/methods
```js
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

"2.6" in "plexi.mongodb@2.6" means mongodb version "2.6.x"

"pmongo" cli arguments is same as original "mongod" options.

##### windows
```sh
> npm install -g plexi.mongodb@2.6

> pmongo
or
> pmongo --port <port> --dbpath "some/dir" --logpath "some/dir/mongodb.log"
```

##### osx/linux
```sh
$ sudo npm install -g plexi.mongodb@2.6

$ sudo pmongo
or
$ sudo pmongo --port <port> --dbpath "some/dir" --logpath "some/dir/mongodb.log"
```

### License

  [MIT](LICENSE)