# plexi.mongodb

```
$ npm install plexi.mongodb --save
```

```js
var pmongo = require('plexi.mongodb');
pmongo.create('mydb', {
	log: true,				// optional
	dbpath: 'some/dir',		// datafile path, default is node_modules/plexi.mongodb/data/(mydb)
	logpth: 'some/file'		// logfile path, default is node_modules/plexi.mongodb/logs/(mydb).log
	// ... same as mongod cli arguments ("--" can be omitted)
	// http://docs.mongodb.org/manual/reference/program/mongod/
});
pmongo.start(console);
```

### Install the executable

"2.6" in "plexi.mongodb@2.6" means mongodb version "2.6.x"
"pmongo" cli arguments is same as original "mongod" options.

#### windows
```
> npm install -g plexi.mongodb@2.6
...
> pmongo
or
> pmongo --port <port> --dbpath "some/dir" --logpath "some/dir/mongodb.log"
```

##### osx/linux
```
$ sudo npm install -g plexi.mongodb@2.6
...
$ sudo pmongo
or
$ sudo pmongo --port <port> --dbpath "some/dir" --logpath "some/dir/mongodb.log"
```

### License

  [MIT](LICENSE)