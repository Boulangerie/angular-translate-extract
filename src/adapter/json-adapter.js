/**
 * angular-translate-extractor
 * https://github.com/Boulangerie/angular-translate-extractor
 *
 * Copyright (c) 2015 "firehist" Benjamin Longearet, contributors
 * Licensed under the MIT license.
 *
 */

import path from 'path'
import fs from 'fs'
import Adapter from './adapter'
import {Utils} from './../utils'
import {Translations} from './../translations'

export class JsonAdapter extends Adapter {

  constructor(log, basePath) {
    super(log, basePath)
    this.utils = new Utils({
      "basePath": basePath
    })

    this.params = {
      lang: [],
      prefix: '',
      prefix: '',
      suffix: '.json',
      source: '',
      defaultLang: '.',
      stringifyOptions: null
    }
  }

  getDestFilename(language) {
    return path.resolve(this.basePath, path.join(this.params.dest, this.params.prefix + language + this.params.suffix))
  }

  persist(translations) {
    // Build all output language files
    this.params.lang.forEach((language) => {


      let destFilename = this.getDestFilename(language),
        filename = this.params.source,
        json = {}

      // Test source filename
      if (filename === '' || !fs.statSync(filename)) {
        filename = destFilename
      }

      this.log.debug('Process ' + language + ' : ' + filename)

      var isDefaultLang = (this.params.defaultLang === language)
      try {
        // Test if filename exists
        fs.statSync(filename)
        this.log.debug('File Exists. ' + destFilename)
        json = JSON.parse(fs.readFileSync(filename, {encoding: 'utf8'}))
      } catch (e) {
        this.log.debug('Create file: ' + destFilename + (isDefaultLang ? ' (' + language + ' is the default language)' : ''))
      }

      let _translations = translations.getMergedTranslations(Translations.flatten(json), isDefaultLang)

      var stats = translations.getStats()
      var statEmptyType = translations.params.nullEmpty ? "null" : "empty"
      var statPercentage =  Math.round(stats[statEmptyType] / stats["total"] * 100)
      statPercentage = isNaN(statPercentage) ? 100 : statPercentage
      var statsString = "Statistics : " +
        statEmptyType + ": " + stats[statEmptyType] + " (" + statPercentage + "%)" +
        " / Updated: " + stats["updated"] +
        " / Deleted: " + stats["deleted"] +
        " / New: " + stats["new"]

      this.log.info(statsString)

      // Write JSON file for language
      fs.writeFileSync(path.resolve(this.basePath, destFilename), this.utils.customStringify(_translations, this.stringifyOptions) + '\n')

    })
  }

}
