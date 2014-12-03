# plexi.mongodb

```
$ npm install plexi.mongodb --save
```

```js
var pmongo = require('plexi.mongodb');

var mongod = pmongo.create('mydb', {
	log: true,			// use default logfile
	port: 20999,		// port
	dbpath: 'somedir',	// datafile path, default is node_modules/plexi.mongodb/data/(mydb)
	logpath: 'somefile.log'	// logfile path, default(must be log:true) is node_modules/plexi.mongodb/logs/(mydb).log
}).start(console);

// child process
//console.log(mongod.child);

// mongod process cwd
console.log(mongod.cwd);

// exec command
console.log(mongod.command);

// process connect status(boolean)
//console.log(mongod.connected);

// process pid
console.log(mongod.pid());

var mongod2 = pmongo.create('db2', {log:true}).start(console);
var mongod3 = pmongo.create('db3').start();

// stop mongod instance
mongod.stop();
mongod2.stop();
```

### Install the executable

"2.6" in "plexi.mongodb@2.6" means mongodb version "2.6.x"

"pmongo" cli arguments is same as original "mongod" options.

#### windows
```
> npm install -g plexi.mongodb@2.6

> pmongo
or
> pmongo --port <port> --dbpath "some/dir" --logpath "some/dir/mongodb.log"
```

##### osx/linux
```
$ sudo npm install -g plexi.mongodb@2.6

$ sudo pmongo
or
$ sudo pmongo --port <port> --dbpath "some/dir" --logpath "some/dir/mongodb.log"
```

### License

  [MIT](LICENSE)