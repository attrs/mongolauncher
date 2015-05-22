var osenv = require('osenv');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

/*
 * Mongodb Install Automatically
 * 
 * options
 * 	version: mongodb version (string/선택/기본값 3.0.3)
 * 	path: path to install binary (string/선택/기본값 ~/.plexi/mongodb/)
 * 
 * callback
 * 	err: 에러
 * 	info: 설치정보 (object)
 * 		home: installed path (ex: /Users/user/.plexi/mongodb/mongodb-osx-x86_64-3.0.3)
 * 		bin: bin directory path (ex: /Users/user/.plexi/mongodb/mongodb-osx-x86_64-3.0.3/bin/ )
 * 	
 */
function ensureIntall(options, callback) {
	options.path = options.path || path.join('.plexi.mongodb', 'mongodb-osx-x86_64-2.6.5.tgz');
	
	var target = path.resolve(osenv.home(), options.path);
	callback(null, {
		home: target,
		bin: path.resolve(target, 'bin')
	});
}

/*
 * Launch Mongodb 
 *
 * options
 * 	dbpath: 데이터파일위치 (string/필수)
 * 	bind_ip: 호스트명 (string/선택)
 * 	port: 포트번호 (number/선택)
 * 	logpath: 로그파일위치 (string/선택)
 * 	cwd: 실행할 디렉토리 (string/선택/기본값 process.cwd())
 * 	detached: 프로세스를 detach 할지 여부 (boolean/선택/기본값 false)
 * 	encoding: 프로세스 stdout 인코딩 (string/선택/기본값 utf8)
 * 	env: 실행시 지정할 환경변수 (object)
 * 	version: mongodb version (string/선택/기본값 3.0.3)
 * 	path: path to install binary (string/선택/기본값 ~/.plexi/mongodb/)
 *
 * callback
 * 	err: 에러
 * 	ps: mongod process 객체 (object)
 * 		command: 실행 커맨드 (string)
 * 		argv: 실행시 지정한 파라미터 (string)
 * 		config: 프로세스 설정 (object)
 */
var processes = {};
function launch(options, callback) {
	if( arguments.length === 1 && typeof options === 'function' ) callback = options;
	options = options || {};
	options.timeout = typeof options.timeout === 'number' && options.timeout < 0 ? options.timeout : 10000;
	
	if( options.port && typeof options.port !== 'number' ) return callback(new Error('invalid port: ' + options.port));
	if( typeof options.dbpath !== 'string' ) return callback(new Error('invalid dbpath: ' + options.dbpath));
	if( !fs.existsSync(path.resolve(options.dbpath)) ) return callback(new Error('not exists dbpath: ' + options.dbpath));
	
	ensureIntall(options, function(err, info) {
		if( err )  return callback(err);
		
		var argv = options.argv || [];
		if( options.dbpath ) argv = argv.concat(['--dbpath', options.dbpath]);
		if( options.bind_ip ) argv = argv.concat(['--bind_ip', options.bind_ip]);
		if( options.port ) argv = argv.concat(['--port', options.port]);
		if( options.logpath ) argv = argv.concat(['--logpath', options.logpath]);
				
		var config = {};
		if( 'encoding' in options ) config.encoding = options.encoding;
		if( 'cwd' in options ) config.cwd = options.cwd;
		if( 'env' in options ) config.env = options.env;
		if( 'detached' in options ) config.detached = options.detached;
		
		var command = path.join(info.bin, 'mongod');
		var ps = spawn(command, argv, config);
		ps.command = command;
		ps.argv = argv;
		ps.config = config;
		ps.options = options;
		
		var sent = false;
		var closed = false;
		var msg = '';
		
		var send = function(err, ps) {
			sent = true;
			callback(err, ps);
		};
		
		var inspector = function(data) {
			if( !sent ) {
				msg += data.toString();
				if( ~msg.indexOf('waiting for connections on port ') ) {
					send(null, ps);
					ps.stdout.removeListener('data', inspector);
					ps.stderr.removeListener('data', inspector);
				}
				
				var p;
				if( ~(p = msg.indexOf('[initandlisten] ERROR:')) ) {
					send(new Error(msg.substring(p + 23, msg.indexOf('\n', p)).split('\r').join('')));
				}
			}
		};
		
		ps.stdout.on('data', inspector);
		ps.stderr.on('data', inspector);
		ps.on('close', function(code) {
			closed = true;
			if( !sent ) send(new Error('start error: ' + (error || 'unknown')));
		});
		ps.on('error', function(err) {
			send(err);
		});
		ps.on('uncaughtException', function(err) {
			send(err);
		});
		
		processes[ps.pid] = ps;
		if( options.stdout ) ps.stdout.pipe(options.stdout);
		if( options.stderr ) ps.stderr.pipe(options.stderr);
	});
}

/*
 * 작동중인 모든 mongod 프로세스 종료
 */
function kill(pid, callback) {
	var ps = processes[pid];
	if( ps ) {
		ps.kill();
		processes[pid];
	}
	
	if( typeof callback === 'function' ) return ps ? callback(null, ps) : callback(new Error('not exists:' + pid));
	else return ps;
}

function killEmAll(callback) {
	for(var pid in processes) {
		processes[pid].kill();
		delete processes[pid];
	}
	if( typeof callback === 'function' ) return callback();
}

/*
 * pid 를 통해 process 찾기
 */
function get(pid, callback) {
	var ps = processes[pid];
	if( typeof callback === 'function' ) return ps ? callback(null, ps) : callback(new Error('not exists:' + pid));
	else return ps;
}

function all(callback) {
	var argp = [];
	for(var pid in processes) {
		argp.push(processes[pid]);
	}
	if( typeof callback === 'function' ) return callback(null, argp);
	else return argp;
}

process.on('beforeExit', function() {
	killEmAll();
}).on('SIGINT', function() {
	killEmAll();
}).on('SIGTERM', function() {
	killEmAll();
}).on('SIGHUP', function() {
	killEmAll();
}).on('exit', function() {
	killEmAll();
});

module.exports = {
	ensureIntall: ensureIntall,
	launch: launch,
	get: get,
	all: all,
	kill: kill,
	killEmAll: killEmAll,
	console: require('./console.js')
};
