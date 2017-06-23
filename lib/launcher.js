var spawn = require('child_process').spawn;
var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var os = require('os');
var installer = require('./installer.js');


var processes = {};
var ports = {};

function mongod(options, callback) {
  var dir = options.dir;
  var argv = options.argv;
  var cwd = options.cwd;
  var stdout = options.stdout;
  var stderr = options.stderr;
  var stderr = options.stderr;
  
  var config = {};
  if( options.encoding ) config.encoding = options.encoding;
  if( options.env ) config.env = options.env;
  if( options.detached ) config.detached = options.detached;
  
  var command = path.join(dir, 'mongod');
  var ps = spawn(command, argv, config);
  ps.command = command;
  ps.argv = argv;
  
  processes[ps.pid] = ps;
  ports[ps.port] = ps;
  
  var okill = ps.kill;
  ps.kill = function(callback) {
    okill.call(ps);
    delete processes[ps.pid];
    delete ports[ps.port];
    
    if( typeof callback === 'function' ) callback();
    return ps;
  };
  
  var sent = false;
  var closed = false;
  var msg = '';
  
  var send = function(err, ps) {
    if( !sent ) callback(err, ps);
    sent = true;
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
      } else if( ~(p = msg.indexOf('[initandlisten] exception')) ) {
        send(new Error(msg.substring(p + 15, msg.indexOf('\n', p)).split('\r').join('')));
      }
    }
  };
  
  ps.stdout.on('data', inspector);
  ps.stderr.on('data', inspector);
  ps.on('close', function(code) {
    closed = true;
    send(new Error('start error: abnormal closed:' + code));
  });
  ps.on('error', function(err) {
    send(err);
  });
  ps.on('uncaughtException', function(err) {
    send(err);
  });
  
  if( stdout ) ps.stdout.pipe(stdout);
  if( stderr ) ps.stderr.pipe(stderr);
}

function ensureAuth(options, callback) {
  if( !options.username ) return callback();
  if( !options.dbname ) return callback();
  if( !options.password ) return callback();
  if( !options.port ) return callback(new Error('missing options.port'));
  if( !options.dir ) return callback(new Error('missing options.dir'));
  
  mongod({
    port: options.port,
    dir: options.dir
  }, function(err, ps) {
    if( err ) return callback(err);
    
    execSync(`${path.join(options.dir, 'mongo')} --port ${options.port} ${options.dbname} --eval "db.createUser(
      {
        user: '${options.username}',
        pwd: '${options.password}',
        roles: [
          {
            role: 'dbAdmin', db: '${options.dbname}'
          }, {
            role: 'readWrite', db: '${options.dbname}'
          }
        ]
      }
    )"`);
    
    ps.kill();
    callback();
  });
}

/*
 * Launch Mongodb 
 *
 * options
 *   dbpath: 데이터파일위치 (string/필수)
 *   bind_ip: 호스트명 (string/선택)
 *   port: 포트번호 (number/선택)
 *   logpath: 로그파일위치 (string/선택)
 *   cwd: 실행할 디렉토리 (string/선택/기본값 process.cwd())
 *   detached: 프로세스를 detach 할지 여부 (boolean/선택/기본값 false)
 *   encoding: 프로세스 stdout 인코딩 (string/선택/기본값 utf8)
 *   env: 실행시 지정할 환경변수 (object)
 *   version: mongodb version (string/선택/기본값 3.0.3)
 *   path: path to install binary (string/선택/기본값 ~/.mongolauncher/mongodb/)
 *
 * callback
 *   err: 에러
 *   ps: mongod process 객체 (object)
 *     command: 실행 커맨드 (string)
 *     argv: 실행시 지정한 파라미터 (string)
 *     config: 프로세스 설정 (object)
 */
function launch(options, callback) {
  if( !arguments.length ) options = {port:27017, mkdirs:true};
  if( arguments.length === 1 ) {
    if( typeof options == 'function' ) {
      callback = options;
      options = null;
    } else if( typeof options == 'number' ) {
      options = {port:options, mkdirs:true};
    }
  }
  
  callback = typeof callback == 'function' ? callback : function(err, ps) {
    if( err ) return console.error(err.stack);
    console.log('mongodb started, pid:' + ps.pid);
  };
  
  var timeout = +options.timeout && +options.timeout > 0 ? +options.timeout : 10000;
  var port = +options.port || 27017;
  var username = options.username;
  var password = options.password;
  var dbname = options.dbname || 'default';
  var dbpath = options.dbpath || path.join(os.homedir(), '.mongolauncher', 'db', dbname);
  var logpath = options.logpath || path.join(os.homedir(), '.mongolauncher', 'log', dbname + '.log');
  var logdir = path.dirname(logpath);
  var mkdirs = options.mkdirs === true ? true : false;
  var version = options.version;
  var bind_ip = options.bind_ip;
  var encoding = options.encoding;
  var cwd = options.cwd || process.cwd();
  var env = options.env;
  var detached = options.detached === true ? true : false;
  var argv = options.argv || [];
  var stdout = options.stdout;
  var stderr = options.stderr;
  
  if( mkdirs ) {
    if( !fs.existsSync(path.resolve(process.cwd(), dbpath)) ) {
      fse.ensureDirSync(path.resolve(process.cwd(), dbpath), 0777);
    }
    
    if( !fs.existsSync(logdir) ) {
      fse.ensureDirSync(logdir, 0777);
    }
  }
  
  installer.ensureInstall({
    version: version
  }, function(err, info) {
    if( err ) return callback(err);
    
    if( dbpath ) argv = argv.concat(['--dbpath', dbpath]);
    if( bind_ip ) argv = argv.concat(['--bind_ip', bind_ip]);
    if( port ) argv = argv.concat(['--port', port]);
    if( logpath ) argv = argv.concat(['--logpath', logpath]);
    
    var config = {
      cwd: cwd
    };
    
    if( encoding ) config.encoding = encoding;
    if( env ) config.env = env;
    if( detached ) config.detached = detached;
    
    ensureAuth({
      dir: info.bin,
      dbname: dbname,
      username: username,
      password: password,
      port: port
    }, function(err) {
      if( err ) return callback(err);
      
      var command = path.join(info.bin, 'mongod');
      var ps = spawn(command, argv, config);
      ps.command = command;
      ps.argv = argv;
      ps.port = port;
      ps.dbname = dbname;
      ps.dbpath = dbpath;
      ps.logpath = logpath;
      ps.info = info;
      
      processes[ps.pid] = ps;
      ports[ps.port] = ps;
      
      var okill = ps.kill;
      ps.kill = function(callback) {
        okill.call(ps);
        delete processes[ps.pid];
        delete ports[ps.port];
        
        if( typeof callback === 'function' ) callback();
        return ps;
      };
      
      var sent = false;
      var closed = false;
      var msg = '';
      
      var send = function(err, ps) {
        if( !sent ) callback(err, ps);
        sent = true;
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
          } else if( ~(p = msg.indexOf('[initandlisten] exception')) ) {
            send(new Error(msg.substring(p + 15, msg.indexOf('\n', p)).split('\r').join('')));
          }
        }
      };
      
      ps.stdout.on('data', inspector);
      ps.stderr.on('data', inspector);
      ps.on('close', function(code) {
        closed = true;
        send(new Error('start error: abnormal closed:' + code));
      });
      ps.on('error', function(err) {
        send(err);
      });
      ps.on('uncaughtException', function(err) {
        send(err);
      });
      
      if( stdout ) ps.stdout.pipe(stdout);
      if( stderr ) ps.stderr.pipe(stderr);
    });
  });
}

/*
 * 작동중인 모든 mongod 프로세스 종료
 */
function stopAll(callback) {
  for(var pid in processes) processes[pid].kill();
  if( typeof callback === 'function' ) return callback();
}

/*
 * pid 를 통해 process 찾기
 */
function get(pid, callback) {
  var ps = processes[pid];
  if( typeof callback === 'function' ) return ps ? callback(null, ps) : callback(new Error('not exists pid:' + pid));
  else return ps;
}

function port(port, callback) {
  var ps = ports[port];
  if( typeof callback === 'function' ) return ps ? callback(null, ps) : callback(new Error('not exists mongod at port:' + port));
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
  //console.log('!!beforeExit');
  stopAll();
}).on('SIGINT', function() {
  //console.log('!!SIGINT');
  stopAll(function(err) {
    if( err ) console.error('exit error', err);
    process.exit();
  });
}).on('SIGTERM', function() {
  //console.log('!!SIGTERM');
  stopAll(function(err) {
    if( err ) console.error('exit error', err);
    process.exit();
  });
}).on('SIGHUP', function() {
  //console.log('!!SIGHUP');
  stopAll(function(err) {
    if( err ) console.error('exit error', err);
    process.exit();
  });
}).on('exit', function() {
  //console.log('!!exit');
  stopAll();
})

module.exports = {
  launch: launch,
  get: get,
  port: port,
  all: all,
  stopAll: stopAll
};
