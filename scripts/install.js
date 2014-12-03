#!/usr/bin/env node

var path = require('path');
var fs = require('fs');

var version = require('../package.json').version;
var url;
var base = 'http://mongodb-dist-test.dev/'; //'http://downloads.mongodb.org';

switch( process.platform ) {
	case 'win32':
		var arch = process.arch;
		switch( process.arch ) {
			case 'x64':
				arch = 'x86_64';
				break;
			case 'ia32':
				arch = 'i386';
				break;
			case 'x86':
				arch = 'i386';
				break;
		}
	
		url = base + '/win32/mongodb-win32-' + arch + '-2008plus-' + version + '.zip';
		break;
	case 'darwin':
		url = base + '/osx/mongodb-osx-x86_64-' + version + '.tgz';
		break;
	case 'linux':		
		var arch = process.arch;
		switch( process.arch ) {
			case 'x64':
				arch = 'x86_64';
				break;
			case 'ia32':
				arch = 'i686';
				break;
			case 'x86':
				arch = 'i686';
				break;
		}
		
		url = base + '/linux/mongodb-linux-' + arch + '-' + version + '.tgz';
		break;
	case 'sunos':
		url = base + '/sunos5/mongodb-sunos5-' + arch + '-' + version + '.tgz';
		break;
}

var rmdirRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                rmdirRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


var dest = path.resolve(__dirname, '..', 'download');
var to = path.resolve(__dirname, '..', 'mongodb');

rmdirRecursive(dest);
rmdirRecursive(to);

var Download = require('download');
var progress = require('download-status');

new Download({ extract: true, strip: 1, mode: '755' })
    .get(url)
    .dest(dest)
	.use(progress())
	.run(function (err, files, stream) {
	    if (err) {
	        throw err;
	    }
	
		fs.mkdirSync(to);
		fs.renameSync(dest, to);
		rmdirRecursive(dest);
	}
);

if( false ) {
	var download = require('download');
	var rimraf = require('rimraf');
	var createBar = require('multimeter')(process);
	
	rimraf.sync(dest);
	var bar = createBar({ before: url + ' [' });

	var total = 0;
	var progress = 0;

	download(url, dest, { extract: true, strip: 1 }).on('response', function(res) {
		total = parseInt(res.headers['content-length']);
	}).on('data', function(data) {
		progress += data.length;
		if( total > 0 ) {
			var percent = progress / total * 100;
			bar.percent(percent);
			if( percent === 100 ) {
				console.log(', Done.');
			}
		}
	}).on('error', function(err) {
		console.log(', Failure.', err);
	}).on('close', function() {
		
	
	
	});
}
/*
https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-2.6.5.zip
https://fastdl.mongodb.org/win32/mongodb-win32-i386-2.6.5.zip
https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.6.5.tgz
https://fastdl.mongodb.org/linux/mongodb-linux-i686-2.6.5.tgz
https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-2.6.5.tgz
https://fastdl.mongodb.org/sunos5/mongodb-sunos5-x86_64-2.6.5.tgz
*/