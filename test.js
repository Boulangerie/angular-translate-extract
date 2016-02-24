
var test = require('./lib/index.js')

var obj = {
  prefix:    '11_',
  suffix:    '.json',
  src:       [ './test/fixtures/links.js' ],
  lang:      ['en_US'],
  dest:      './test/existing',
  namespace: true
};

test.proceed(obj, {
  basePath: __dirname
})