var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var os = require('os');
var installer = require('./installer.js');


var processes = {};
var ports = {};

function mongod(options, callback) {
  var bin = options.bin;
  var argv = options.argv;
  var port = options.port;
  var config = options.config;
  var stdout = options.stdout;
  var stderr = options.stderr;
  var logger = options.logger;
  
  var command = path.join(bin, 'mongod');
  var ps = spawn(command, argv, config);
  ps.command = command;
  ps.argv = argv;
  ps.port = port;
  
  processes[ps.pid] = ps;
  ports[ps.port] = ps;
  
  var okill = ps.kill;
  ps.kill = function(callback) {
    if( !processes[ps.pid] ) return callback && callback();
    
    callback && ps.on('exit', function(code) {
      callback(code);
    });
    
    okill.call(ps);
  };
  
  var finished = false;
  var msg = '';
  var timer;
  
  var finish = function(err) {
    if( finished ) return;
    
    finished = true;
    if( err ) ps.kill();
    callback(err, ps);
  };
  
  var listener = function(data) {
    if( !finished ) {
      msg += data.toString();
      if( ~msg.indexOf('waiting for connections on port ') ) {
        ps.stdout.removeListener('data', listener);
        ps.stderr.removeListener('data', listener);
        return finish();
      }
      
      var p;
      if( ~(p = msg.indexOf('[initandlisten] ERROR:')) ) {
        return finish(new Error(msg.substring(p + 23, msg.indexOf('\n', p)).split('\r').join('')));
      } else if( ~(p = msg.indexOf('[initandlisten] exception')) ) {
        return finish(new Error(msg.substring(p + 15, msg.indexOf('\n', p)).split('\r').join('')));
      }
      
      if( timer ) clearTimeout(timer);
      timer = setTimeout(function() {
        if( !finished ) finish();
      }, 2000);
    }
  };
  
  ps.stdout.on('data', listener);
  ps.stderr.on('data', listener);
  
  ps.stdout.on('data', function(data) {
    if( logger ) logger.write(data);
  });
  ps.stderr.on('data', function(data) {
    if( logger ) logger.write(data);
  });
  
  ps.on('close', function(code) {
    if( !finished ) finish(new Error('abnormal closed:' + code));
  })
  .on('error', function(err) {
    finish(err);
  })
  .on('uncaughtException', function(err) {
    finish(err);
  })
  .on('exit', function(err) {
    if( stdout ) ps.stdout.unpipe(stdout);
    if( stderr ) ps.stderr.unpipe(stderr);
    
    delete processes[ps.pid];
    delete ports[ps.port];
  });
  
  if( stdout ) ps.stdout.pipe(stdout);
  if( stderr ) ps.stderr.pipe(stderr);
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
  
  var basedir = path.join(os.homedir(), '.mongolauncher');
  var timeout = +options.timeout && +options.timeout > 0 ? +options.timeout : 10000;
  var port = +options.port || 27017;
  var username = options.username;
  var password = options.password;
  var authdb = options.authdb || 'admin';
  var dbpath = options.dbpath || path.join(basedir, 'db');
  var logpath = options.logpath;
  var mkdirs = options.mkdirs === false ? false : true;
  var version = options.version;
  var bind_ip = options.bind_ip;
  var encoding = options.encoding;
  var cwd = options.cwd || process.cwd();
  var env = options.env;
  var auth = options.auth;
  var detached = options.detached === true ? true : false;
  var argv = options.argv || ['--directoryperdb', '--smallfiles', '--journal'];
  var stdout = options.stdout;
  var stderr = options.stderr;
  
  if( logpath && typeof logpath != 'string' ) logpath = path.join(path.dirname(dbpath), 'logs', 'mongo.log');
  if( ~argv.indexOf('--logpath') ) return callback(new Error('--logpath arg is not supported, use options.logpath instead'));
  
  if( mkdirs ) {
    if( !fs.existsSync(path.resolve(process.cwd(), dbpath)) ) {
      fse.ensureDirSync(path.resolve(process.cwd(), dbpath), 0777);
    }
    
    if( logpath && !fs.existsSync(path.dirname(logpath)) ) {
      fse.ensureDirSync(path.dirname(logpath), 0777);
    }
  }
  
  var logger;
  if( logpath ) {
    if( fs.existsSync(logpath) ) {
      fs.renameSync(logpath, logpath + '-' + (new Date().toISOString()));
    }
    
    logger = fs.createWriteStream(logpath, { flags: 'w' });
  }
  
  installer.ensureInstall({
    version: version
  }, function(err, info) {
    if( err ) return callback(err);
    
    if( dbpath ) argv = argv.concat(['--dbpath', dbpath]);
    if( bind_ip ) argv = argv.concat(['--bind_ip', bind_ip]);
    if( port ) argv = argv.concat(['--port', port]);
    
    var config = {
      cwd: cwd
    };
    
    if( encoding ) config.encoding = encoding;
    if( env ) config.env = env;
    if( detached ) config.detached = detached;
    
    mongod({
      bin: info.bin,
      argv: argv,
      port: port,
      config: config,
      stdout: stdout,
      stderr: stderr,
      logger: logger
    }, function(err, ps) {
      if( err ) return callback(err);
      if( !auth ) return callback(null, ps);
      
      if( !username ) {
        ps.kill();
        return callback(new Error('missing options.username'));
      }
      
      if( !password ) {
        ps.kill();
        return callback(new Error('missing options.password'));
      }
      
      var cmds = [
        `${path.join(info.bin, 'mongo')} --port ${port} ${authdb} --eval "db.dropUser('${username}')"`,
        `${path.join(info.bin, 'mongo')} --port ${port} ${authdb} --eval "db.createUser(
          {
            user: '${username}',
            pwd: '${password}',
            roles: [
              { role: 'userAdminAnyDatabase', db: '${authdb}' },
              { role: 'dbAdminAnyDatabase', db: '${authdb}' },
              { role: 'readWriteAnyDatabase', db: '${authdb}' }
            ]
          }
        )"`
      ];
      
      exec(cmds.join(' && '), function(err, out, errmsg) {
        if( err ) {
          if( logger ) logger.write(errmsg);
          return console.error(errmsg) && ps.kill() && callback(err);
        }
        
        if( stdout ) stdout.write(out);
        if( logger ) logger.write(out);
        
        ps.kill(function(err) {
          if( err ) return callback(err);
          
          mongod({
            bin: info.bin,
            argv: argv.concat(['--auth']),
            port: port,
            config: config,
            stdout: stdout,
            stderr: stderr,
            logger: logger
          }, callback);
        });
      });
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
