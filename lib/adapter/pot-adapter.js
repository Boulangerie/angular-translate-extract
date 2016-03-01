'use strict';

/**
 * angular-translate-extractor
 * https://github.com/Boulangerie/angular-translate-extractor
 *
 * Copyright (c) 2015 "originof" Manuel Mazzuola, contributors
 * Licensed under the MIT license.
 *
 */

(function () {
  'use strict';

  var _log, _basePath;

  var fs = require('fs');
  var path = require('path');
  var Po = require('pofile');

  function PotObject(id, msg, ctx) {
    this.id = id;
    this.msg = msg || '';
    this.ctx = ctx || '';
  }

  PotObject.prototype.toString = function () {
    return "" + "msgctxt \"" + String(this.ctx).replace(/"/g, '\\"') + "\"\n" + "msgid \"" + String(this.id).replace(/"/g, '\\"') + "\"\n" + "msgstr \"" + String(this.msg).replace(/"/g, '\\"') + "\"";
  };

  function PotAdapter(log, basePath) {
    _log = log;
    _basePath = basePath;
  }

  PotAdapter.prototype.init = function (params) {
    this.dest = params.dest || '.';
    this.prefix = params.prefix;
    this.suffix = params.suffix || '.pot';

    _log.debug('Init PodAdapter', this.dest, this.prefix, this.suffix);
  };

  PotAdapter.prototype.persist = function (_translation) {
    var translations = _translation.getMergedTranslations({});
    var catalog = new Po();

    catalog.headers = {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Content-Transfer-Encoding': '8bit',
      'Project-Id-Version': ''
    };

    for (var msg in translations) {
      catalog.items.push(new PotObject(msg, translations[msg]));
    }

    catalog.items.sort(function (a, b) {
      return a.id.toLowerCase().localeCompare(b.id.toLowerCase());
    });

    var fullPath = path.resolve(_basePath, this.dest, this.prefix + this.suffix);
    fs.writeFileSync(fullPath, catalog.toString());
  };

  module.exports = PotAdapter;
})();