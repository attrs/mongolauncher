#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var http = require('http');
var chalk = require('chalk');
var Semver = require('semver');
var Download = require('download');
var progress = require('download-status');
var wrench = require('wrench');
var ProgressBar = require('progress');
var osenv = require('osenv');

function geturl(version) {
	var arch = process.arch;
	var base = 'http://downloads.mongodb.org';
	var url, filename;
	
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
	
	return url;
}

function rmdirRecursive(path) {
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

var renew = function() {
	process.stdin.resume();
	process.stdin.setEncoding('utf-8');
	process.stdout.write(chalk.yellow('mongodb version: ') + '' + chalk.gray('(2.6.5) '));
};

process.stdin.on('data', function (inputVersion) {
	process.stdin.pause();
	
	inputVersion = inputVersion.replace(/[\n\r]/g, ' ').trim() || '2.6.5';

	var semver = Semver.parse(inputVersion);
	if( !semver ) {
		process.stdout.write('invalid version: ' + inputVersion + '\n');
		return renew();
	}
	var version = [semver.major, semver.minor, semver.patch].join('.');

	var checkversion = function() {
		var url = geturl(version);
		var filename = url.substring(url.lastIndexOf('/') + 1);
		process.stdout.write(chalk.green('checking version: ' + version + ' (' + url + ') ... '));
	
		// check cache, if file exists in cache, use it
		var userhome = osenv.home();
		var cachedir = path.resolve(userhome, '.plexi.mongodb');
		var cachefile = path.resolve(cachedir, filename);
		var dest = path.resolve(__dirname, '..', 'mongodb');
		if( !fs.existsSync(cachedir) ) {
			try {
				fs.mkdirSync(cachedir);
			} catch(err) {
				cachedir = path.resolve(__dirname, '..', 'download');
				cachefile = path.resolve(cachedir, filename);
			}
		}
	
		var copy = function() {		
			if( fs.existsSync(dest) ) rmdirRecursive(dest);
		
			var files = wrench.readdirSyncRecursive(cachefile);
			var total = files.length;
			var current = 0;

			var bar = new ProgressBar(chalk.cyan('   install') + ' : [:bar] :current/:total', {
				width: 20,
				total: total,
				callback: function() {
					//console.log();
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
				.use(function(instance, url) {
					process.stdout.write(chalk.green('Download\n'));
				})
				.use(progress())
				.run(function (err, files, stream) {
				    if (err) {
						process.stdout.write(chalk.red('Error\n'));
						console.log(chalk.red(err));
				    	return renew();
				    }
					copy();
				}
			);
		} else {
			process.stdout.write(chalk.green('From Cache\n'));
			copy();
		}
	};
	checkversion();
});

renew();



//base = 'http://mongodb-download.dev/';

/*
https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-2.6.5.zip
https://fastdl.mongodb.org/win32/mongodb-win32-i386-2.6.5.zip
https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.6.5.tgz
https://fastdl.mongodb.org/linux/mongodb-linux-i686-2.6.5.tgz
https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-2.6.5.tgz
https://fastdl.mongodb.org/sunos5/mongodb-sunos5-x86_64-2.6.5.tgz
*/