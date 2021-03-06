// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var del = require('del');
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var es = require('event-stream');
var runSequence = require('run-sequence');
var sprite = require('css-sprite').stream;
var rename = require('gulp-rename');
var durandal = require('gulp-durandal');
var uglify = require('gulp-uglify');

gulp.task('clean', function(cb) {
	del(['./build'], cb);
});

gulp.task('clean-build-app', function(cb) {
	del(['./build/js/app'], cb);
});

gulp.task('web-app', function(cb) {
	es.concat(
		/* WEB APP */
		gulp.src('./web/app/**/*.js')
			.pipe(gulp.dest('./build/js/app')),

		gulp.src('./web/app/**/*.html')
			.pipe(gulp.dest('./build/js/app')),

		gulp.src('./web/index.*')
			.pipe(gulp.dest('./build')),
		/* WEB APP */

		/* APP DEPENDENCIES */
		gulp.src('./web/appDependencies/lib/bootstrap/**/*min*')
			.pipe(gulp.dest('./build/lib/bootstrap')),

		gulp.src('./web/appDependencies/lib/font-awesome/css/*min*')
			.pipe(gulp.dest('./build/lib/font-awesome/css')),

		gulp.src('./web/appDependencies/lib/font-awesome/fonts/*')
			.pipe(gulp.dest('./build/lib/font-awesome/fonts')),

		gulp.src('./web/appDependencies/lib/jquery/*min*')
			.pipe(gulp.dest('./build/lib/jquery')),

		gulp.src('./web/appDependencies/lib/knockout/**/*')
			.pipe(gulp.dest('./build/lib/knockout')),

		gulp.src('./web/appDependencies/lib/jquery/jquery.cookie.js')
			.pipe(uglify())
			.pipe(gulp.dest('./build/lib/jquery')),

		gulp.src('./web/appDependencies/lib/durandal/**/*.js')
			.pipe(uglify())
			.pipe(gulp.dest('./build/lib/durandal')),

		gulp.src('./web/appDependencies/lib/require/**/*')
			.pipe(uglify())
			.pipe(gulp.dest('./build/lib/require'))
		/* APP DEPENDENCIES */
	).on('end', cb);
});

gulp.task('settings', function() {
	var settingsFile = null;
	switch (process.env.ENVIRONMENT) {
		case "OPTIMLOL_UI_HEROKU":
			settingsFile = "./web/app/settings.prod";
			break;
		case "OPTIMLOL_UI_LOCAL":
			settingsFile = "./web/app/settings.local";
			break;
		default:
			settingsFile = "./web/app/settings.local";
	}

	gulp.src(settingsFile)
		.pipe(rename('settings.js'))
		.pipe(gulp.dest('./build/js/app/'));
});

gulp.task('images', function(cb) {
	es.concat(
		gulp.src('./web/appDependencies/img/champions/*.png')
			.pipe(sprite({
				name: 'champions',
				margin: 0
			}))
			.pipe(gulp.dest('./build/img/')),

		gulp.src('./web/appDependencies/img/logos/*.png')
			.pipe(sprite({
				name: 'logos',
				margin: 0
			}))
			.pipe(gulp.dest('./build/img/')),

		gulp.src('./web/appDependencies/img/divisions/division*.png')
			.pipe(sprite({
				name: 'divisions',
				margin: 0
			}))
			.pipe(gulp.dest('./build/img/')),

		gulp.src('./web/appDependencies/img/divisions/league*.png')
			.pipe(sprite({
				name: 'leagues',
				margin: 0
			}))
			.pipe(gulp.dest('./build/img/')),

		gulp.src('./web/appDependencies/img/misc/*.png')
			.pipe(gulp.dest('./build/img/'))
	).on('end', cb);
});

gulp.task('sass', function() {
	gulp.src('./web/appDependencies/sass/main.scss')
		.pipe(sass())
		.pipe(gulp.dest('./build/css'));
});

// Lint Task
gulp.task('lint', function() {
	gulp.src(['./web/app/**/*.js', './node_api/app/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('webserver', function() {
	connect.server({
		root: './build/',
		fallback: './build/index.html',
		port: 9001
	});
});

gulp.task('durandal', function() {
 	return durandal({
		baseDir: 'build/js/app',
		main: 'main.js',
		minify: true,
		almond: true
	})
	.pipe(gulp.dest('./build/js/'));
});

gulp.task('js-watch', function() {
	runSequence('web-app', 'durandal');
});

gulp.task('watch', function() {
	gulp.watch('./web/appDependencies/sass/**/*.scss', ['sass']);
	gulp.watch('./web/app/**/*', ['js-watch']);
});

// Default Task
gulp.task('build-web', function() {
	runSequence('clean', ['web-app', 'settings', 'images', 'sass'], 'durandal', 'clean-build-app');
});

gulp.task('debug-web', function() {
	runSequence('clean', 'images', ['web-app', 'settings', 'sass'], 'durandal', ['watch', 'webserver']);
});