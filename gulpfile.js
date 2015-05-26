var gulp = require('gulp');
var mocha = require('gulp-mocha');
var argv = require('attrs.argv');

// define path in advance
var paths = {
	test: {
		install: 'test/install.js',
		launch: 'test/launch.js',
		find: 'test/find.js',
		kill: 'test/kill.js'
	}
};

// generate test tasks
(function() {
	var names = [];
	var srcs = [];
	
	for(var name in paths.test) {
		var src = paths.test[name];
		var test_name = 'test.' + name;
		names.push(test_name);
		srcs.push(src);
		
		(function(test_name, src) {
			gulp.task(test_name, function () {
				return gulp.src(src, {read: false})
					.pipe(mocha(argv))
					.once('error', function (err) {
						console.error(err.stack);
					    process.exit(1);
					})
					.once('end', function () {
					    process.exit();
					});
			});
		})(test_name, src);
	}

	gulp.task('test', function () {
		return gulp.src(srcs, {read: false})
			.pipe(mocha(argv))
			.once('error', function (err) {
				console.error(err.stack);
			    process.exit(1);
			})
			.once('end', function () {
			    process.exit();
			});
	});
})();

// default task
gulp.task('default', ['test']);
