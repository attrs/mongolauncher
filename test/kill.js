var m = require('../');
var assert = require('assert');
var wrench = require('wrench');
var fs = require('fs');
var path = require('path');

describe('kill mongod process by pid', function() {
	var datadir = path.resolve(process.cwd(), '.mongo', 'data');
	
	before(function() {
		wrench.mkdirSyncRecursive(datadir);
	});

	after(function() {
		wrench.rmdirSyncRecursive(datadir);
	});
		
	it('should be found by mongod pid', function(done) {
		this.timeout(0);
		m.launch({
			bind_ip: '127.0.0.1',
			port: 27020,
			dbpath: datadir
		}, function(err, ps) {
			if( err ) return done(err);
			m.kill(ps.pid, function(err) {
				if( err ) return done(err);
				done();
			});
		});
	});
});
