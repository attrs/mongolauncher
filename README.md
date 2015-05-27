# plexi.mongodb

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Gratipay][gratipay-image]][gratipay-url]
<!-- [![Build Status][travis-image-flat]][travis-url] -->

Automatically install & launch MongoDB.

## Installation
```sh
$ npm install plexi.mongodb --save
```

## Usage

#### Programmatically
> if mongodb not installed your system will be installed before launch.

```js
var launcher = require('plexi.mongodb');

launcher.launch({
	version: '3.0.3',
	port: 27017,
	dbpath: '.mongo/data',
	logfile: '.mongo/logs/mongo.log'
}, function(err, ps) {
	if( err ) return console.error(err);
	
	console.log('mongodb started pid:%s', ps.pid);
});
```

#### Global Usage
##### install & launch mongodb
> cli arguments is same as original "mongod" options.

```sh
$ npm install -g plexi.mongodb
$ pm --port 27017 --dbpath "some/dir"
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