'use strict';

var grunt = require('grunt');
var _ = require('lodash');
var path = require('path');
var extractor = require('../lib/index.js')

var i18nextract_config = require('./angular-translate-extractor.conf');

exports.i18nextract = {

  setUp: function (callback) {
    _.forEach(i18nextract_config, function(v, k) {
      extractor.proceed(v, {
        basePath: path.resolve('./')
      })
    })
    callback();
  },

  default_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/00_fr_FR.json');
    grunt.log.writeflags(actual);
    var expected = grunt.file.read('test/expected/00_fr_FR.json');
    grunt.log.writeflags(expected);
    test.equal(actual, expected, '00 - default_options should be equal.');

    test.done();
  },

  default_exists_i18n: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/01_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/01_fr_FR.json' );
    test.equal( actual, expected, '01 - default_exists_i18n should be equal.' );

    test.done();
  },

  default_deleted_i18n: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/02_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/02_fr_FR.json' );
    test.equal(actual, expected, '02 - default_deleted_i18n should be equal.');

    test.done();
  },

  interpolation_bracket: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/03_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/03_fr_FR.json' );
    test.equal(actual, expected, '03 - interpolation_bracket should be equal.');

    test.done();
  },

  default_language: function(test) {
    test.expect(2);

    var actual = grunt.file.read( 'tmp/04_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/04_fr_FR.json' );
    test.equal( actual, expected, '04 - default_language fr_FR should be equal.' );

    var actual = grunt.file.read( 'tmp/04_en_US.json' );
    var expected = grunt.file.read( 'test/expected/04_en_US.json' );
    test.equal( actual, expected, '04 - default_language en_US should be equal.' );

    test.done();
  },

  json_extract: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/05_en_US.json' );
    var expected = grunt.file.read( 'test/expected/05_en_US.json' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  },

  sub_namespace: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/06_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/06_fr_FR.json' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  },

  sub_namespace_default_language: function(test) {
    test.expect(2);

    var actual = grunt.file.read( 'tmp/07_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/07_fr_FR.json' );
    test.equal( actual, expected, 'Should equal.' );

    var actual = grunt.file.read( 'tmp/07_en_US.json' );
    var expected = grunt.file.read( 'test/expected/07_en_US.json' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  },

  sub_namespace_default_language_source: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/08_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/08_fr_FR.json' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  },

  consistent_stringify: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/09_A_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/09_A_fr_FR.json' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  },

  consistent_stringify_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/09_B_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/09_B_fr_FR.json' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  },

  extra_regexs: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/10_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/10_fr_FR.json' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  },

  extra_regexs_object: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/10_1_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/10_1_fr_FR.json' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  },

  keep_translation_links: function(test) {
    test.expect(1);

    var actual = grunt.file.readJSON( 'test/existing/11_en_US.json' );
    var expected = grunt.file.readJSON( 'test/expected/11_en_US.json' );
    test.deepEqual( actual, expected, 'Should equal.' );

    test.done();
  },

  key_as_text: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/12_en_US.json' );
    var expected = grunt.file.read( 'test/expected/12_en_US.json' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  },

  ternary_keys: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/13_fr_FR.json' );
    var expected = grunt.file.read( 'test/expected/13_fr_FR.json' );
    test.equal( actual, expected, 'ternary_keys: 13_fr_FR.json should equal.' );

    test.done();
  },

  extract_to_pot: function(test) {
    test.expect(1);

    var actual = grunt.file.read( 'tmp/template.pot' );
    var expected = grunt.file.read( 'test/expected/template.pot' );
    test.equal( actual, expected, 'Should equal.' );

    test.done();
  }

};
