/* eslint max-nested-callbacks:0 func-names:0 */

'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var Stream = require('stream');
var fs = require('fs');
var path = require('path');

var assert = require('assert');
var StreamTest = require('streamtest');

var ttf2eot = require('../src/index.js');

describe('gulp-ttf2eot conversion', function() {
  var filename = path.join(__dirname, 'fixtures', 'iconsfont');
  var eot = fs.readFileSync(filename + '.eot');

  // Iterating through versions
  StreamTest.versions.forEach(function(version) {

    describe('for ' + version + ' streams', function() {

      describe('with null contents', function() {

        it('should let null files pass through', function(done) {

          StreamTest[version].fromObjects([new gutil.File({
            path: 'bibabelula.foo',
            contents: null,
          })])
          .pipe(ttf2eot())
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              return done(err);
            }
            assert.equal(objs.length, 1);
            assert.equal(objs[0].path, 'bibabelula.foo');
            assert.equal(objs[0].contents, null);
            done();
          }));

        });

      });

      describe('in buffer mode', function() {

        it('should work', function(done) {

          gulp.src(filename + '.ttf', { buffer: true })
            .pipe(ttf2eot())
            // Uncomment to regenerate the test files if changes in the ttf2eot lib
            // .pipe(gulp.dest(__dirname + '/fixtures/'))
            .pipe(StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                return done(err);
              }
              assert.equal(objs.length, 1);
              assert.equal(objs[0].path, filename + '.eot');
              assert.equal(objs[0].contents.toString('utf-8'), eot.toString('utf-8'));
              done();
            }));

        });

        it('should work with the clone option', function(done) {

          gulp.src(filename + '.ttf', { buffer: true })
            .pipe(ttf2eot({ clone: true }))
            .pipe(StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                return done(err);
              }
              assert.equal(objs.length, 2);
              assert.equal(objs[0].path, filename + '.ttf');
              assert.equal(
                objs[0].contents.toString('utf-8'),
                fs.readFileSync(filename + '.ttf', 'utf-8')
              );
              assert.equal(objs[1].path, filename + '.eot');
              assert.equal(objs[1].contents.toString('utf-8'), eot.toString('utf-8'));
              done();
            }));

        });

        it('should let non-ttf files pass through', function(done) {

          StreamTest[version].fromObjects([new gutil.File({
            path: 'bibabelula.foo',
            contents: new Buffer('ohyeah'),
          })])
          .pipe(ttf2eot())
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              return done(err);
            }
            assert.equal(objs.length, 1);
            assert.equal(objs[0].path, 'bibabelula.foo');
            assert.equal(objs[0].contents.toString('utf-8'), 'ohyeah');
            done();
          }));

        });
      });


      describe('in stream mode', function() {
        it('should work', function(done) {

          gulp.src(filename + '.ttf', { buffer: false })
            .pipe(ttf2eot())
            .pipe(StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                return done(err);
              }
              assert.equal(objs.length, 1);
              assert.equal(objs[0].path, filename + '.eot');
              objs[0].contents.pipe(StreamTest[version].toText(function(err, text) {
                if(err) {
                  return done(err);
                }
                assert.equal(text, eot.toString('utf-8'));
                done();
              }));
            }));

        });

        it('should work with the clone option', function(done) {

          gulp.src(filename + '.ttf', { buffer: false })
            .pipe(ttf2eot({ clone: true }))
            .pipe(StreamTest[version].toObjects(function(err, objs) {
              if(err) {
                return done(err);
              }
              assert.equal(objs.length, 2);
              assert.equal(objs[0].path, filename + '.ttf');
              assert.equal(objs[1].path, filename + '.eot');
              objs[0].contents.pipe(StreamTest[version].toText(function(err, text) {
                if(err) {
                  return done(err);
                }
                assert.equal(text, fs.readFileSync(filename + '.ttf', 'utf-8'));
                objs[1].contents.pipe(StreamTest[version].toText(function(err, text) {
                  if(err) {
                    return done(err);
                  }
                  assert.equal(text, eot.toString('utf-8'));
                  done();
                }));
              }));
            }));

        });

        it('should let non-ttf files pass through', function(done) {

          StreamTest[version].fromObjects([new gutil.File({
            path: 'bibabelula.foo',
            contents: new Stream.PassThrough(),
          })])
          .pipe(ttf2eot())
          .pipe(StreamTest[version].toObjects(function(err, objs) {
            if(err) {
              return done(err);
            }
            assert.equal(objs.length, 1);
            assert.equal(objs[0].path, 'bibabelula.foo');
            assert(objs[0].contents instanceof Stream.PassThrough);
            done();
          }));

        });
      });

    });

  });

});
