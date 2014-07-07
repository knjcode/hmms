gulp = require 'gulp'
gutil = require 'gulp-util'

# misc
clean = require 'gulp-clean'

# compilers
uglify = require 'gulp-uglify'
coffee = require 'gulp-coffee'
jade   = require 'gulp-jade'


gulp.task 'script', ->
  gulp.src './coffee/*.coffee'
    .pipe coffee()
    .pipe uglify()
    .pipe gulp.dest './js/'

gulp.task 'html', ->
  gulp.src './jade/*.jade'
    .pipe jade()
    .pipe gulp.dest './'

gulp.task 'watch', ->
  gulp.watch './coffee/*.coffee', ['script']
  gulp.watch './jade/*.jade', ['html']

gulp.task 'clean', ->
  gulp.src './js/hmms.js', {read:false}
    .pipe clean()
  gulp.src './*.html', {read:false}
    .pipe clean()

gulp.task 'default', ['script', 'html']
