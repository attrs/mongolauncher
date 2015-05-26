var m = require('../');
var assert = require('assert');
var wrench = require('wrench');
var fs = require('fs');
var path = require('path');

describe('kill mongod process by pid', function() {
	it('should be found by mongod pid', function(done) {
		this.timeout(0);
		m.launch({
			bind_ip: '127.0.0.1',
			port: 27020,
			dbpath: '.mongo/killtest'
		}, function(err, ps) {
			if( err ) return done(err);
			m.stop(ps.pid, function(err) {
				if( err ) return done(err);
				done();
			});
		});
	});
});
