del = require 'del'
gulp = require 'gulp'
browserSync = require 'browser-sync'
reload = browserSync.reload
runSequence = require 'run-sequence'

# compilers
uglify = require 'gulp-uglify'
coffee = require 'gulp-coffee'
jade   = require 'gulp-jade'
sass   = require 'gulp-ruby-sass'


gulp.task 'coffee', ->
  gulp.src './coffee/*.coffee'
    .pipe coffee()
    .pipe uglify()
    .pipe gulp.dest './js/'

gulp.task 'sass', ->
  gulp.src './sass/*.scss'
    .pipe sass(unixNewlines: true)
    .pipe gulp.dest './css/'

gulp.task 'jade', ->
  gulp.src './jade/*.jade'
    .pipe jade(pretty: true)
    .pipe gulp.dest './'

gulp.task 'serve', ->
  browserSync({
    notify: false,
    server: {
      baseDir: ['./']
    }
  })
  gulp.watch './coffee/*.coffee', ['coffee', reload]
  gulp.watch './sass/*.scss', ['sass', reload]
  gulp.watch './jade/*.jade', ['jade', reload]

gulp.task 'clean', (done) ->
  del(['./js/hmms.js', './*.html', './css/hmms.css'], done)

gulp.task 'default', ->
  runSequence 'clean', 'coffee', 'sass', 'jade'
