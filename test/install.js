var m = require('../');
var assert = require('assert');
var wrench = require('wrench');
var fs = require('fs');
var path = require('path');

describe('install', function() {		
	it('sould be installed mongodb at {home}/.plexi/mongodb/', function(done) {
		this.timeout(0);
		m.ensureIntall({
			version: '3.0.3'
		}, function(err, info) {
			if( err ) return done(err);
			done();
		});
	});
});
