var m = require('../');
var assert = require('assert');
var wrench = require('wrench');
var fs = require('fs');
var path = require('path');

describe('install', function() {		
	it('sould be installed mongodb at {home}/.plexi/mongodb/', function(done) {
		this.timeout(0);
		m.ensureInstall({
			version: '2.6.10'
		}, function(err, info) {
			if( err ) return done(err);
			// install by default (3.0.3)
			m.ensureInstall(function(err, info2) {
				if( err ) return done(err);
				done();
			});
		});
	});
});
