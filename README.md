# angular-translate-extract

This node package aims to extract all the translation keys for angular-translate project. It searches in given folder to extract key + default translation if exists. eg:

* `{{'KEY_IN_VIEW' | translate }}`
* `$translate.instant('KEY_IN_SCRIPT')`

Each found key is then extracted to json or po files with translations. For
each local defined in Gruntfile separate json is created:

    {
      "KEY_IN_VIEW": "",
      "KEY_IN_SCRIPT": ""
    }

or

    msgid ""
    msgstr ""
    "Content-Type: text/plain; charset=UTF-8\n"
    "Content-Transfer-Encoding: 8bit\n"
    "Project-Id-Version: \n"

    msgctxt ""
    msgid "all.tato.tati"
    msgstr ""

Translation should be provided in the created files. On the next run,
`Boulangerie/angular-translate-extract` will not change keys already translated.
It will only add keys that were added to the source and remove the
ones that are not present anymore in the source.


##Status

[![NPM](https://nodei.co/npm/angular-translate-extract.png)](https://nodei.co/npm/angular-translate-extract/)

[![NPM Package](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/angular-translate-extract) [![Build Status](https://travis-ci.org/Boulangerie/angular-translate-extract.svg?branch=master)](https://travis-ci.org/Boulangerie/angular-translate-extract)  [![NPM Download](https://img.shields.io/npm/dt/angular-translate-extract.svg)](https://www.npmjs.com/package/angular-translate-extract)

## Getting Started
Install this node package next to your project.

Use `npm install -D angular-translate-extract`

angular-translate-extract provide an `extract` method to start the extraction.

This extraction is made to work with the [angular-translate][angular_translate] project created by [Pascal Precht][pascalPrecht]

## Grunt & Gulp integration

WIP!

[grunt-angular-translate](https://github.com/Boulangerie/grunt-angular-translate)

[gulp-angular-translate](https://github.com/Boulangerie/gulp-angular-translate)

## Use cases

### Views

#### Filters

`{{'TRANSLATION' | translate}}`

`{{'TRANSLATION' | translate:XXXXXX}}`

#### Directives

`<a href="#" translate>TRANSLATION</a>`

#### Directives plural (custom attribute angular-plural-extract to automatize extraction)

`<span translate="TRANSLATION_KEY" angular-plural-extract="['TEXT FOR ONE','# TEXT FOR OTHER']" translate-values="{NB: X}" translate-interpolation="messageformat"></span>`

### Javascript

#### Filter

`$filter("translate")("TRANSLATION")`

#### Service angular-translate

`$translate('TRANSLATION')`

`$translate.instant('TRANSLATION')`

`$translate(['TRANSLATION', 'TRANSLATION_1'])`

#### Ternary operators

`{{ myVar ? 'KEY_ONE' : 'KEY_TWO' }}`
`{{ myVar ? "KEY_ONE" : "KEY_TWO" }}`_
`{{ myVar ? "KEY_ONE" : "KEY_TWO" | translate }}`_
`myVar ? "KEY_ONE" : "KEY_TWO"`_

## Configuration

### Options

Options src and jsonSrc may be specified according to the grunt Configuring tasks guide.

- [src](#src)
- [nullEmpty](#nullempty-v026)
- [namespace](#namespace-v026)
- [interpolation](#interpolation)
- [jsonSrc](#jsonSrc)
- [jsonSrcName](#jsonSrcName)
- [defaultLang](#defaultLang)
- [lang](#lang)
- [prefix](#prefix)
- [suffix](#suffix)
- [dest](#dest)
- [safeMode](#safeMode)
- [stringifyOptions](#stringifyOptions)
- [keyAsText](#keyAsText)

#### src

Type: `Array`
Default: `undefined`

Example: `[ 'src/**/*.js' ]`

Define a file list to parse for extract translation.

#### nullEmpty (v0.2.6)

Type: `Boolean`
Default: `false`

Example: `true`

If set to true, it will replace all final empty translations by *null* value.

#### namespace (v0.2.6)

Type: `Boolean`
Default: `false`

Example: `true`

If set to true, it will organize output JSON like the following.
`````
{
  "MODULE": {
    "CATEGORY": {
      "TITLE": "My Title",
      "TITLE1": null
    }
  }
}
`````


#### interpolation

Type: `Object`
Default: `{ startDelimiter: '{{', endDelimiter: '}}' }`

Example: `{ startDelimiter: '[[', endDelimiter: ']]' }`

Define interpolation symbol use for your angular application.
The angulars docs about ($interpolateProvider)[http://docs.angularjs.org/api/ng.$interpolateProvider] explain how you can configure the interpolation markup.

#### jsonSrc

Type: `Array`
Default: `undefined`

Example: `[ 'config/*.json' ]`

Define a JSON file list to parse for extract translation.

#### jsonSrcName

Type: `Array`
Default: `undefined`

Example: `[ 'label', 'name' ]`

Define the keys to find corresponding values through JSON object.

#### defaultLang

Type: `String`
Default: `undefined`

Example: `"en_US"`

Define the default language. For default language, by default the key will be set as value.

#### customRegex

Type: `Array<String>`
Default: `[]`

Example: `
customRegex: [
  'tt-default="\'((?:\\\\.|[^\'\\\\])*)\'\\|translate"'
],
`

Will extract `MY.CUSTOM.REGEX` from the following HTML: `<article tt-default="'MY.CUSTOM.REGEX'|translate">`.

Enjoy your custom regex guys!

#### lang

Type: `Array`
Default: `undefined`

Example: `['fr_FR', 'en_US']`

Define language to be extract (fr__FR, en__US, xxx). xxx will be the output filename wrapped by prefix and suffix option.

#### prefix

Type: `String`
Default: `""`

Example: `"project_"`

Set prefix to output filenames (cf [angular-translate#static-files][https://github.com/PascalPrecht/angular-translate/wiki/Asynchronous-loading#using-extension-static-files-loader]).

#### suffix

Type: `String`
Default:  `""`

Example: `".json"`

Set suffix to output filenames (cf [angular-translate#static-files][https://github.com/PascalPrecht/angular-translate/wiki/Asynchronous-loading#using-extension-static-files-loader]).

#### dest

Type: `String`
Default:  `""`

Example: `"src/assets/i18n"`

Relative path to output folder.

#### safeMode

Type: `Boolean`
Default: `false`

If safeMode is set to `true` the deleted translations will stay in the output lang file.

#### stringifyOptions

Type: `Boolean` or `Object`
Default: `false`

If stringifyOptions is set to `true` the output will be sort (case insensitive).
If stringifyOptions is an `object`, you can easily check [json-stable-stringify](https://github.com/substack/json-stable-stringify) README.

#### keyAsText
Type: `Boolean`
Default: `false`

If keyAsText is set to `true` translations keys works also as value for this translation.

## Test

You will find the tests files into `test` directory.

To run test use `grunt test`

All testing files following this pattern: `./test/*_test.js`

Testing running with `nodeunit`.

_To be improved... Feel free :D_

## Contributing

Special thanks to: @SKoschnicke SKoschnicke

@AlaaSulimankhazaleh
@arianerocha arianerocha
@ClouDesire ClouDesire
@d42f d42f
@elhigu elhigu
@gitter-badger gitter-badger
@gruntjs-updater gruntjs-updater
@IFours IFours
@jdahlbom jdahlbom
@JeroMiya JeroMiya
@jplusplus jplusplus
@jsteenkamp jsteenkamp
@jtheoof jtheoof
@laketea laketea
@marcin-wosinek marcin-wosinek
@mchambaud mchambaud
@openheimer openheimer
@peng-jiesi peng-jiesi
@phw phw
@rafallo rafallo
@realityking realityking
@rewoo rewoo
@RobertSasak RobertSasak
@sclassen sclassen
@liamlin liamlin
@orbweb orbweb
@tamtakoe tamtakoe
@telpalbrox telpalbrox
@TiagoLopes92 TiagoLopes92
@tomteman tomteman
@tthew tthew
@twolff-iow twolff-iow
@wilgert wilgert

## License

Copyright (c) 2013 Benjamin Longearet
Licensed under the MIT license.

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[angular_translate]: https://github.com/PascalPrecht/angular-translate
[pascalPrecht]: https://github.com/PascalPrecht

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/882c3bab5f5b2d7c63f79337a9a3688a "githalytics.com")](http://githalytics.com/Boulangerye/angular-translate-extract)
