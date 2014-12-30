// Load plugins and declare variables
var gulp = require("gulp"),
	del = require("del"),
	bower = require("bower"),
	browserify = require("browserify"),
	source = require("vinyl-source-stream"),
	buffer = require("vinyl-buffer"),
	es = require("event-stream"),
	qunit = require("node-qunit-phantomjs"),
	gutil = require("gulp-util"),
	sourcemaps = require("gulp-sourcemaps"),
	plumber = require("gulp-plumber"),
	gitmodified = require("gulp-gitmodified"),
	jshint = require("gulp-jshint"),
	jscs = require("gulp-jscs"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	sass = require("gulp-sass"),
	combinemq = require("gulp-combine-mq"),
	autoprefixer = require("gulp-autoprefixer"),
	minify = require("gulp-minify-css");

// Make browserify bundle
function bundle(files, opts) {
	var streams = [],
		bundler = function(file) {
			opts.entries = "./" + file;

			return browserify(opts).bundle()
			.on("error", function(err) {
				gutil.log(err);
				// End the stream to prevent gulp from crashing
				this.end();
			})
			.pipe(source(file.split(/[\\/]/).pop()));
		};

	opts = opts || {};

	if (files && files instanceof Array) {
		for (var i = 0, l = files.length; i < l; i++) {
			if (typeof files[i] === "string") {
				streams.push(bundler(files[i]));
			}
		}
	} else if (typeof files === "string") {
		streams.push(bundler(files));
	}

	return es.merge.apply(null, streams).pipe(buffer());
}

// Install and copy third-party libraries
gulp.task("bower", function() {
	return bower.commands.install([], { save: true }, {})
	.on("error", gutil.log);
});

// Lint JavaScript files
gulp.task("lint", function() {
	return gulp.src([ "src/js/**/*.js", "test/**/*.js" ])
	.pipe(plumber())
	.pipe(gitmodified("modified"))
	.pipe(jshint())
	.pipe(jshint.reporter("jshint-stylish"))
	.pipe(jshint.reporter("fail"))
	.pipe(jscs())
	.on("error", gutil.log);
});

// Combine and minify scripts
gulp.task("scripts", [ "bower" ], function() {
	return bundle("test/test.js", { debug: true })
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(plumber())
	.pipe(gutil.env.production ? uglify() : gutil.noop())
	.pipe(rename({ suffix: ".min" }))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("dist/scripts"))
	.on("error", gutil.log);
});

// Generate styles
gulp.task("styles", function() {
	return gulp.src("test/**/*.scss")
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(sass({
		style: gutil.env.production ? "compressed" : "expanded",
		lineNumbers: !gutil.env.production,
		sourcemap: true
	}))
	.pipe(combinemq())
	.pipe(gutil.env.production ? autoprefixer() : gutil.noop())
	.pipe(gutil.env.production ? minify() : gutil.noop())
	.pipe(rename({ suffix: ".min" }))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("dist/styles"))
	.on("error", gutil.log);
});

// Clean up generated files
gulp.task("clean", function() {
	return del([ "dist" ]);
});

// Build scripts and styles
gulp.task("build", [ "scripts", "styles" ]);

// Run unit tests with phantom.js
gulp.task("test", [ "build" ], function() {
	return qunit("./test/index.html", {
		verbose: true,
		timeout: 10
	});
});

gulp.task("watch", function() {
	gulp.watch([ "src/js/**/*.js", "test/**/*.js" ], [ "scripts" ]);
	gulp.watch([ "src/scss/**/*.scss", "test/**/*.scss" ], [ "styles" ]);
});

// Default Task
gulp.task("default", [ "lint", "build", "test" ]);
