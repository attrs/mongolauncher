var m = require('../');
var assert = require('assert');
var wrench = require('wrench');
var fs = require('fs');
var path = require('path');

describe('launch', function() {		
	it('should be launched at 127.0.0.1:27018', function(done) {
		this.timeout(0);
		m.launch({
			bind_ip: '127.0.0.1',
			port: 27018,
			dbpath: '.mongo/launchtest'
		}, function(err, ps) {
			if( err ) return done(err);
			done();
		});
	});
});