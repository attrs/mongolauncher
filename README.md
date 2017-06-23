# mongolauncher

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

Automatically install & launch MongoDB.

## Installation
```sh
$ npm install mongolauncher --save
```

## Usage

#### Programmatically

```js
var mongolauncher = require('mongolauncher');

mongolauncher.launch({
	version: '3.0.3',
	port: 27017,
    arg: ['--auth'],
	dbpath: '.mongo/data',
	logfile: '.mongo/logs/mongo.log'
}, function(err, ps) {
	if( err ) return console.error(err);
	
	console.log('mongodb started pid:%s', ps.pid);
});
```

### License

  [MIT](LICENSE)  

[npm-image]: https://img.shields.io/npm/v/mongolauncher.svg?style=flat
[npm-url]: https://npmjs.org/package/mongolauncher
[downloads-image]: https://img.shields.io/npm/dm/mongolauncher.svg?style=flat
[downloads-url]: https://npmjs.org/package/mongolauncher
[travis-image-flat]: https://img.shields.io/travis/attrs/mongolauncher.svg?style=flat
[travis-image]: https://travis-ci.org/attrs/plexi.mongodb.svg?branch=master
[travis-url]: https://travis-ci.org/attrs/plexi.mongodb
[gratipay-image]: https://img.shields.io/gratipay/teamattrs.svg?style=flat
[gratipay-url]: https://gratipay.com/teamattrs/