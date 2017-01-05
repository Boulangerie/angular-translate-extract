/**
 * angular-translate-extractor
 * https://github.com/Boulangerie/angular-translate-extractor
 *
 * Copyright (c) 2015 "firehist" Benjamin Longearet, contributors
 * Licensed under the MIT license.
 *l
 */

import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import Log from 'log'
import pkg from '../package.json'
import {Utils} from './utils.js'
import {Translations} from './translations.js'
import {PotAdapter} from './adapter/pot-adapter.js'
import {JsonAdapter} from './adapter/json-adapter.js'


var extractor
(function() {
  var _log, _utils

  var Extractor = function (data, option) {
    this.data = data

    // Grab NODE_ENV to set debug flag!
    var debug = process.env.NODE_ENV === 'debug'
    _log = new Log(option.log || (debug ? 'debug' : 'info'))

    this.basePath = (option && option.basePath) || __dirname
    _utils = new Utils({
      basePath: this.basePath
    })

    // Check lang parameter
    if (!_.isArray(this.data.lang) || !this.data.lang.length) {
      throw new Error('lang parameter is required.')
    }

    // Declare all var from configuration
    var files             = _utils.expand(this.data.src),
        dest              = _utils.getRealPath(this.data.dest || '.'),
        jsonSrc           = _utils.expand(this.data.jsonSrc || []),
        jsonSrcName       = _.union(this.data.jsonSrcName || [], ['label']),
        interpolation     = this.data.interpolation || {startDelimiter: '{{', endDelimiter: '}}'},
        source            = _utils.getRealPath(this.data.source),
        defaultLang       = this.data.defaultLang,
        nullEmpty         = this.data.nullEmpty || false,
        namespace         = this.data.namespace || false,
        prefix            = this.data.prefix || '',
        safeMode          = this.data.safeMode ? true : false,
        suffix            = this.data.suffix,
        customRegex       = _.isArray(this.data.customRegex) || _.isObject(this.data.customRegex) ? this.data.customRegex : [],
        stringify_options = this.data.stringifyOptions || null,
        results           = {},
        keyAsText         = this.data.keyAsText || false,
        adapter           = this.data.adapter || 'json'

    // Extract regex strings from content and feed results object
    var _extractTranslation = (regexName, regex, content, results) => {
      var r
      _log.debug("---------------------------------------------------------------------------------------------------")
      _log.debug('Process extraction with regex : "' + regexName + '"')
      _log.debug(regex)
      regex.lastIndex = 0
      while ((r = regex.exec(content)) !== null) {

        // Result expected [STRING, KEY, SOME_REGEX_STUF]
        // Except for plural hack [STRING, KEY, ARRAY_IN_STRING]
        if (r.length >= 2) {
          var translationKey, evalString
          var translationDefaultValue = ""

          switch (regexName) {
            case 'HtmlDirectiveSimpleQuote':
            case 'HtmlDirectiveDoubleQuote':
              translationKey = r[1].trim()
              translationDefaultValue = (r[2] || "").trim()
              break
            case 'HtmlDirectivePluralFirst':
              if (!r.length > 2) {
                return
              }
              var tmp = r[1]
              r[1] = r[2]
              r[2] = tmp
            case 'HtmlDirectivePluralLast':
              evalString = eval(r[2])
              if (_.isArray(evalString) && evalString.length >= 2) {
                translationDefaultValue = "{NB, plural, one{" + evalString[0] + "} other{" + evalString[1] + "}" + (evalString[2] ? ' ' + evalString[2] : '') + "}"
              }
              translationKey = r[1].trim()
              break
            default:
              translationKey = r[1].trim()
          }

          // Avoid empty translation
          if (translationKey === "") {
            return
          }

          switch (regexName) {
            case "commentSimpleQuote":
            case "HtmlFilterSimpleQuote":
            case "JavascriptServiceSimpleQuote":
            case "JavascriptServiceInstantSimpleQuote":
            case "JavascriptFilterSimpleQuote":
              translationKey = translationKey.replace(/\\\'/g, "'");
              break;
            case "HtmlNgBindHtml":
              translationKey = translationKey.replace(/\\\'/g, "'");
              translationKey = translationKey.replace(/&quot;/g, '"');
              break;
            case "commentDoubleQuote":
            case "HtmlFilterDoubleQuote":
            case "JavascriptServiceDoubleQuote":
            case "JavascriptServiceInstantDoubleQuote":
            case "JavascriptFilterDoubleQuote":
              translationKey = translationKey.replace(/\\\"/g, '"')
              break
            case "JavascriptServiceArraySimpleQuote":
            case "JavascriptServiceArrayDoubleQuote":
              var key

              if(regexName === "JavascriptServiceArraySimpleQuote") {
                key = translationKey.replace(/'/g, '')
              } else {
                key = translationKey.replace(/"/g, '')
              }
              key = key.replace(/[\][]/g, '')
              key = key.split(',')

              key.forEach(function(item){
                item = item.replace(/\\\"/g, '"').trim()
                if (item !== '') {
                  results[item] = translationDefaultValue
                }
              })
              break
          }

          // Check for customRegex
          if (_.isObject(customRegex) && !_.isArray(customRegex) && customRegex.hasOwnProperty(regexName)) {
            if (_.isFunction(customRegex[regexName])) {
              translationKey = customRegex[regexName](translationKey) || translationKey
            }
          }

          // Store the translationKey with the value into results
          var defaultValueByTranslationKey = function (translationKey, translationDefaultValue) {
            if (regexName !== "JavascriptServiceArraySimpleQuote" &&
              regexName !== "JavascriptServiceArrayDoubleQuote") {
              if (keyAsText === true && translationDefaultValue.length === 0) {
                results[translationKey] = translationKey
              } else {
                results[translationKey] = translationDefaultValue
              }
            }
          }

          // Ternary operation
          var ternaryKeys = _utils.extractTernaryKey(translationKey, interpolation)
          if (ternaryKeys) {
            _.forEach(ternaryKeys, function(v) {
              defaultValueByTranslationKey(v)
            })
          } else {
            defaultValueByTranslationKey(translationKey, translationDefaultValue)
          }

        }
      }
    }

    // Regexs that will be executed on files
    var regexs = {
      commentSimpleQuote: '\\/\\*\\s*i18nextract\\s*\\*\\/\'((?:\\\\.|[^\'\\\\])*)\'',
      commentDoubleQuote: '\\/\\*\\s*i18nextract\\s*\\*\\/"((?:\\\\.|[^"\\\\])*)"',
      HtmlFilterSimpleQuote: _utils.escapeRegExp(interpolation.startDelimiter) + '\\s*(?:::)?\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate(:.*?)?\\s*' + _utils.escapeRegExp(interpolation.endDelimiter),
      HtmlFilterDoubleQuote: _utils.escapeRegExp(interpolation.startDelimiter) + '\\s*(?:::)?"((?:\\\\.|[^"\\\\\])*)"\\s*\\|\\s*translate(:.*?)?\\s*' + _utils.escapeRegExp(interpolation.endDelimiter),
      HtmlFilterTernary: _utils.escapeRegExp(interpolation.startDelimiter) + '\\s*(?:::)?([^?]*\\?[^:]*:[^|}]*)\\s*\\|\\s*translate(:.*?)?\\s*' + _utils.escapeRegExp(interpolation.endDelimiter),
      HtmlDirective: '<(?:[^>"]|"(?:[^"]|\\/")*")*\\stranslate(?:>|\\s[^>]*>)([^<]*)',
      HtmlDirectiveSimpleQuote: '<(?:[^>"]|"(?:[^"]|\\/")*")*\\stranslate=\'([^\']*)\'[^>]*>([^<]*)',
      HtmlDirectiveDoubleQuote: '<(?:[^>"]|"(?:[^"]|\\/")*")*\\stranslate="([^"]*)"[^>]*>([^<]*)',
      HtmlDirectivePluralLast: 'translate="((?:\\\\.|[^"\\\\])*)".*angular-plural-extract="((?:\\\\.|[^"\\\\])*)"',
      HtmlDirectivePluralFirst: 'angular-plural-extract="((?:\\\\.|[^"\\\\])*)".*translate="((?:\\\\.|[^"\\\\])*)"',
      HtmlNgBindHtml: 'ng-bind-html="\\s*\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate(:.*?)?\\s*"',
      HtmlNgBindHtmlTernary: 'ng-bind-html="\\s*([^\\"?]*?[^\\":]*:[^\\"|}]*)\\s*\\|\\s*translate(:.*?)?\\s*"',
      JavascriptServiceSimpleQuote: '\\$translate\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'[^\\)]*\\)',
      JavascriptServiceDoubleQuote: '\\$translate\\(\\s*"((?:\\\\.|[^"\\\\])*)"[^\\)]*\\)',
      JavascriptServiceArraySimpleQuote: '\\$translate\\((?:\\s*(\\[\\s*(?:(?:\'(?:(?:\\.|[^.*\'\\\\])*)\')\\s*,*\\s*)+\\s*\\])\\s*)\\)',
      JavascriptServiceArrayDoubleQuote: '\\$translate\\((?:\\s*(\\[\\s*(?:(?:"(?:(?:\\.|[^.*\'\\\\])*)")\\s*,*\\s*)+\\s*\\])\\s*)\\)',
      JavascriptServiceInstantSimpleQuote: '\\$translate\\.instant\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'[^\\)]*\\)',
      JavascriptServiceInstantDoubleQuote: '\\$translate\\.instant\\(\\s*"((?:\\\\.|[^"\\\\])*)"[^\\)]*\\)',
      JavascriptFilterSimpleQuote: '\\$filter\\(\\s*\'translate\'\\s*\\)\\s*\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'[^\\)]*\\)',
      JavascriptFilterDoubleQuote: '\\$filter\\(\\s*"translate"\\s*\\)\\s*\\(\\s*"((?:\\\\.|[^"\\\\\])*)"[^\\)]*\\)'
    }

    // Build dynamic regex from custom regex Object/Array
    _.forEach(customRegex, function (regex, key) {
      if (_.isObject(customRegex) && !_.isArray(customRegex)) {
        regexs[key] = key
      } else {
        regexs['others_' + key] = regex
      }
    })

    /**
     * Recurse an object to retrieve as an array all the value of named parameters
     * INPUT: {"myLevel1": [{"val": "myVal1", "label": "MyLabel1"}, {"val": "myVal2", "label": "MyLabel2"}], "myLevel12": {"new": {"label": "myLabel3é}}}
     * OUTPUT: ["MyLabel1", "MyLabel2", "MyLabel3"]
     * @param data
     * @returns {Array}
     * @private
     */
    var _recurseObject = function (data) {
      var currentArray = new Array()
      if (_.isObject(data) || _.isArray(data['attr'])) {
        for (var attr in data) {
          if (_.isString(data[attr]) && _.indexOf(jsonSrcName, attr) !== -1) {
            currentArray.push(data[attr])
          } else if (_.isObject(data[attr]) || _.isArray(data['attr'])) {
            var recurse = _recurseObject(data[attr])
            currentArray = _.union(currentArray, recurse)
          }
        }
      }
      return currentArray
    }

    /**
     * Start extraction of translations
     */
    // Check directory exist
    try {
      fs.statSync(dest)
    } catch (e) {
      fs.mkdirSync(dest)
    }

    // Parse all files to extract translations with defined regex
    files.forEach(function (file) {

      _log.debug("Process file: " + file)
      var content = fs.readFileSync(file, {encoding: 'utf8'}), _regex
      // Execute all regex defined at the top of this file
      for (var i in regexs) {
        _regex = new RegExp(regexs[i], "gi")
        switch (i) {
          // Case filter HTML simple/double quoted
          case "HtmlFilterSimpleQuote":
          case "HtmlFilterDoubleQuote":
          case "HtmlDirective":
          case "HtmlDirectivePluralLast":
          case "HtmlDirectivePluralFirst":
          case "JavascriptFilterSimpleQuote":
          case "JavascriptFilterDoubleQuote":
            // Match all occurences
            var matches = content.match(_regex)
            if (_.isArray(matches) && matches.length) {
              // Through each matches, we'll execute regex to get translation key
              for (var index in matches) {
                if (matches[index] !== "") {
                  _extractTranslation(i, _regex, matches[index], results)
                }
              }

            }
            break
          // Others regex
          default:
            _extractTranslation(i, _regex, content, results)

        }
      }

    })

    // Parse all extra files to extra
    jsonSrc.forEach(function (file) {
      _log.debug("Process extra file: " + file)
      var content = JSON.parse(fs.readFileSync(file, {encoding: 'utf8'}))
      var recurseData = _recurseObject(content)
      for (var i in recurseData) {
        if (_.isString(recurseData[i])) {
          results[ recurseData[i].trim() ] = ''
        }
      }
    })

    // Create translation object
    var _translation = new Translations({
      "safeMode": safeMode,
      "tree": namespace,
      "nullEmpty": nullEmpty
    }, results)

    // Prepare some params to pass to the adapter
    var params = {
      lang: this.data.lang,
      dest: dest,
      prefix: prefix,
      suffix: suffix,
      source: source,
      defaultLang: defaultLang,
      stringifyOptions: stringify_options
    }

    switch(adapter) {
      case 'pot':
        var toPot = new PotAdapter(_log, this.basePath)
        toPot.init(params)
        _translation.persist(toPot)
        break
      default:
        var toJson = new JsonAdapter(_log, this.basePath)
        toJson.init(params)
        _translation.persist(toJson)
    }

    return this
  }

  module.exports = {
    VERSION: pkg.version,
    NAME: pkg.name,
    extract: Extractor
  }

})()
