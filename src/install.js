#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var http = require('http');

var semver = require('semver').parse(require('../package.json').version);
var version = [semver.major, semver.minor, semver.patch].join('.');
var arch = process.arch;

var url;
var base = 'http://downloads.mongodb.org';
var filename;

//base = 'http://mongodb-download.dev/';

switch( process.platform ) {
	case 'win32':		
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
		
		filename = 'mongodb-win32-' + arch + '-2008plus-' + version + '.zip';
		url = base + '/win32/' + filename;
		break;
	case 'darwin':
		filename = 'mongodb-osx-x86_64-' + version + '.tgz';
		url = base + '/osx/' + filename;
		break;
	case 'linux':
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
		
		filename = 'mongodb-linux-' + arch + '-' + version + '.tgz';
		url = base + '/linux/' + filename;
		break;
	case 'sunos':
		filename = 'mongodb-sunos5-' + arch + '-' + version + '.tgz';
		url = base + '/sunos5/' + filename;
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

// check cache, if file exists in cache, use it
var osenv = require('osenv');
var userhome = osenv.home();

var dest = path.resolve(__dirname, '..', 'mongodb');
var cachedir = path.resolve(userhome, '.plexi.mongodb');
var cachefile = path.resolve(cachedir, filename);

if( fs.existsSync(dest) ) rmdirRecursive(dest);
if( !fs.existsSync(cachedir) ) fs.mkdirSync(cachedir);

var Download = require('download');
var progress = require('download-status');
var wrench = require('wrench');
var ProgressBar = require('progress');

function copy() {	
	var files = wrench.readdirSyncRecursive(cachefile);

	var total = files.length;
	var current = 0;
	
	var bar = new ProgressBar('  Installing... [:bar] :current/:total (' + filename + ')', {
		width: 20,
		total: total,
		callback: function() {
			console.log();
		}
	});

	wrench.copyDirSyncRecursive(cachefile, dest, {
		forceDelete: false,
		preserveFiles: true,
		filter: function() {
			bar.tick();
		}
	});
}

if( !fs.existsSync(cachefile) ) {
	new Download({ extract: true, strip: 1, mode: '755' })
	    .get(url)
	    .dest(cachefile)
		.use(progress())
		.run(function (err, files, stream) {
		    if (err) throw err;
			
			copy();
		}
	);
} else {
	copy();
}



/*
https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-2.6.5.zip
https://fastdl.mongodb.org/win32/mongodb-win32-i386-2.6.5.zip
https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.6.5.tgz
https://fastdl.mongodb.org/linux/mongodb-linux-i686-2.6.5.tgz
https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-2.6.5.tgz
https://fastdl.mongodb.org/sunos5/mongodb-sunos5-x86_64-2.6.5.tgz
*/