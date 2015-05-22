var osenv = require('osenv');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

function ensure_install(options, callback) {
	var installed = path.resolve(osenv.home(), '.plexi.mongodb', 'mongodb-osx-x86_64-2.6.5.tgz');
	callback(null, {
		path: installed,
		command: path.resolve(installed, 'bin/mongod')
	});
}

/*
{
	host: 호스트명 (string),
	port: 포트번호 (number),
	dbpath: 데이터파일위치 (string),
	logpath: 로그파일위치 (string),
	cwd: 실행할 디렉토리 (string),
	encoding: 프로세스 stdout 인코딩 (string),
	env: 실행시 지정할 환경변수 (object)
}
*/
var argp = [];
function launch(options, callback) {
	if( arguments.length === 1 && typeof options === 'function' ) callback = options;
	options = options || {};
	options.timeout = typeof options.timeout === 'number' && options.timeout < 0 ? options.timeout : 10000;
	
	if( options.port && typeof options.port !== 'number' ) return callback(new Error('invalid port: ' + options.port));
	if( typeof options.dbpath !== 'string' ) return callback(new Error('invalid dbpath: ' + options.dbpath));
	if( !fs.existsSync(path.resolve(options.dbpath)) ) return callback(new Error('not exists dbpath: ' + options.dbpath));
	
	ensure_install(options, function(err, info) {
		if( err )  return callback(err);
		
		var argv = options.argv || [];
		if( options.dbpath ) argv = argv.concat(['--dbpath', options.dbpath]);
		if( options.bind_ip ) argv = argv.concat(['--bind_ip', options.bind_ip]);
		if( options.port ) argv = argv.concat(['--port', options.port]);
		if( options.logpath ) argv = argv.concat(['--logpath', options.logpath]);
				
		var config = {
			encoding: options.encoding || 'utf8',
			cwd: options.cwd || process.cwd(),
			env: options.env,
			detached: options.detached ? true : false
		};
		
		var ps = spawn(info.command, argv, config);
		ps.argv = argv;
		ps.command = info.command;
		ps.config = config;
		
		var sent = false;		
		var closed = false;
		var msg = '';
		var inspector = function(data) {
			if( !sent ) {
				msg += data.toString();
				if( ~msg.indexOf('waiting for connections on port ') ) {
					callback(null, ps);
					sent = true;
					ps.stdout.removeListener('data', inspector);
					ps.stderr.removeListener('data', inspector);
				}
			}
		};
		
		ps.stdout.on('data', inspector);
		ps.stderr.on('data', inspector);
		ps.on('close', function(code) {
			closed = true;
			if( !sent ) {
				callback(new Error('error: terminated'));
			}
		});
				
		argp.push(ps);
		if( options.stdout ) ps.stdout.pipe(options.stdout);
		if( options.stderr ) ps.stderr.pipe(options.stderr);
	});
}

function kill() {
	argp.forEach(function(ps) {
		ps.kill();
	});
}

process.on('beforeExit', function () {
	kill();
}).on('SIGINT', function () {
	kill();
}).on('SIGTERM', function () {
	kill();
}).on('SIGHUP', function () {
	kill();
});

launch({
	bind_ip: '127.0.0.1',
	port: 27018,
	dbpath: 'data',
	stdout: process.stdout,
	stderr: process.stderr
}, function(err, ps) {
	if( err ) return console.error('error', err.stack);
	console.log('launched', ps.pid, ps.config, ps.argv, ps.command);
	
	ps.on('close', function(code) {
		console.log('killed', ps.pid, code);
	});
});