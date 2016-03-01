'use strict';

(function () {
  'use strict';

  var path = require('path');
  var expand = require('glob-expand');
  var _ = require('lodash');
  var stringify = require('json-stable-stringify');
  var _basePath;

  function Utils(opt) {
    _basePath = opt.basePath || __dirname;
  }

  /**
   * Stringify a JSON object
   * 1/ If no options, use JSON.stringify
   * 2/ If options, use json-stable-stringify
   * @param {Object} val
   * @param {Object?} options
   * @returns {*}
   */
  Utils.prototype.customStringify = function (val, options) {
    if (options) {
      return stringify(val, _.isObject(options) ? options : {
        space: '    ',
        cmp: function cmp(a, b) {
          var lower = function lower(a) {
            return a.toLowerCase();
          };
          return lower(a.key) < lower(b.key) ? -1 : 1;
        }
      });
    }
    return JSON.stringify(val, null, 4);
  };

  /**
   * Build the absolute path by concat basePath and given relativ path
   * @param {String} givenPath
   * @returns {*}
   */
  Utils.prototype.getRealPath = function (givenPath) {
    try {
      return path.join(_basePath, givenPath);
    } catch (e) {}
    return givenPath;
  };

  /**
   * Wrap glob-expand package with _basePath
   * @param {String} pattern
   * @returns {*}
   */
  Utils.prototype.expand = function (pattern) {
    return expand({
      cwd: _basePath
    }, pattern);
  };

  /**
   * Escape characters into given str
   * @param str
   * @returns {void|string|XML}
   */
  Utils.prototype.escapeRegExp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  };

  /**
   * Extract different part from a ternary operation
   * eg: myVar ? 'myFirst result' : 'mySecond result'
   * @param {String} str
   * @param {Object} interpolation {startDelimiter, endDelimiter)
   * @returns {*}
   */
  Utils.prototype.extractTernaryKey = function (str, interpolation) {
    var delimiterRegexp = new RegExp('(' + this.escapeRegExp(interpolation.startDelimiter) + ')|(' + this.escapeRegExp(interpolation.endDelimiter) + ')', 'g');
    var ternarySimpleQuoteRegexp = new RegExp('([^?]*)\\?(?:\\s*\'((?:\\\\.|[^\'\\\\])*)\'\\s*):\\s*\'((?:\\\\.|[^\'\\\\])*)\'\\s*');
    var ternaryDoubleQuoteRegexp = new RegExp('([^?]*)\\?(?:\\s*"((?:\\\\.|[^"\\\\])*)"\\s*):\\s*"((?:\\\\.|[^"\\\\])*)"\\s*');

    var cleanKey = str.replace(delimiterRegexp, '');
    var match = cleanKey.match(ternaryDoubleQuoteRegexp);
    if (!match) {
      match = cleanKey.match(ternarySimpleQuoteRegexp);
    }

    if (match && match.length > 3) {
      return [match[2], match[3]];
    }
    return null;
  };

  module.exports = Utils;
})();