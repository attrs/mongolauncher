var path = require('path');
var fs = require('fs');
var http = require('http');
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

/*
 * Mongodb Install Automatically
 * 
 * options
 * 	version: mongodb version (string/선택/기본값 3.0.3)
 * 	url: binary download url (string/선택/version 과 함께 입력시 주어진 url 로 다운로드 사용)
 * 	path: path to install binary (string/선택/기본값 ~/.plexi/mongodb/)
 * 
 * callback
 * 	err: 에러
 * 	info: 설치정보 (object)
 * 		home: installed path (ex: /Users/user/.plexi/mongodb/mongodb-osx-x86_64-3.0.3)
 * 		bin: bin directory path (ex: /Users/user/.plexi/mongodb/mongodb-osx-x86_64-3.0.3/bin/ )
 * 	
 */
function ensureInstall(options, callback) {
	if( arguments.length === 1 && typeof options === 'function' ) callback = options;
	if( typeof callback !== 'function' ) throw new TypeError('illegal callback:' + callback);	
	
	options = options || {};
	var version = options.version = options.version || '3.0.3';
	var dir = options.path = options.path || path.resolve(osenv.home(), '.plexi', 'mongodb');
	var url = geturl(options.version);
	var filename = url.substring(url.lastIndexOf('/') + 1);
	var dest = path.resolve(dir, filename);
	
	wrench.mkdirSyncRecursive(dir);
	
	if( !fs.existsSync(dest) ) {
		new Download({ extract: true, strip: 1, mode: '755' })
		    .get(url)
		    .dest(dest)
			.use(function(instance, url) {
				process.stdout.write(chalk.green('Download\n'));
			})
			.use(progress())
			.run(function (err, files, stream) {
				if( err ) return callback(err);
				callback(null, {
					home: dest,
					bin: path.resolve(dest, 'bin')
				});
			}
		);
	} else {		
		callback(null, {
			home: dest,
			bin: path.resolve(dest, 'bin')
		});
	}
}

module.exports = {	
	ensureInstall: ensureInstall
};
