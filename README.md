# postcss-custom-url
Transform `url()` in css

[![npm](https://nodei.co/npm/postcss-custom-url.png?downloads=true)](https://www.npmjs.org/package/postcss-custom-url)

[![version](https://img.shields.io/npm/v/postcss-custom-url.svg)](https://www.npmjs.org/package/postcss-custom-url)
[![status](https://travis-ci.org/zoubin/postcss-custom-url.svg?branch=master)](https://travis-ci.org/zoubin/postcss-custom-url)
[![coverage](https://img.shields.io/coveralls/zoubin/postcss-custom-url.svg)](https://coveralls.io/github/zoubin/postcss-custom-url)
[![dependencies](https://david-dm.org/zoubin/postcss-custom-url.svg)](https://david-dm.org/zoubin/postcss-custom-url)
[![devDependencies](https://david-dm.org/zoubin/postcss-custom-url/dev-status.svg)](https://david-dm.org/zoubin/postcss-custom-url#info=devDependencies)

## Usage

```javascript
var url = require('postcss-custom-url')
var custom = url.custom
var util = url.util

var postcss = require('postcss')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')

postcss(url({
  maxSize: 5,
  assetOutFolder: fixtures('build', 'images'),
}))
.process(
  '.a{ background-image: url(images/octocat_setup.png); }',
  { from: fixtures('a.css'), to: fixtures('build', 'css', 'a.css') }
)
.then(function (result) {
  console.log(result.css)
  // '.a{ background-image: url(../images/octocat_setup.png); }'
})

```

## url

The same with `custom.bind([ util.inline, util.copy ])`

## plugin = custom.bind(customTransforms)

### plugin

Type: `Function`

Your postcss-plugin function

### customTransforms

Type: `Array`

An array of transform functions.

The transform function signature:
`transformFn(result)`

#### result

Type: `Object`

* `result.url`: the url in css. Transforms should modify this field
* `result.file`: the asset file path, if `result.url` is relative
* `result.opts`: options mixed from both the plugin and postcss. It always inludes `from` and `to`.

#### transformFn

Type: `Function`

It could be synchronous,
or made asynchronous in the
[gulp](https://github.com/gulpjs/gulp/blob/master/docs/API.md#async-task-support)-way:

* accept a callback
* return a promise
* return a stream

**NOTE**: usually, you should check `result.url` before you do your transformations.

## util

A group of methods.

### inline

Transform `result.url` to data-url.

Options:

#### maxSize

Type: `Number`

Default: `10`

Specify the maximum file size to inline (in kbytes)

### copy

Copy asset files to proper destinations and transform `result.url`.

Options:

#### useHash

Type: `Boolean`

Default: `false`

If `true`, assets are renamed by their sha1 hashes

#### assetOutFolder

Type: `String`, `Function`

Specify the destination where assets should be copied

If `Function`, it receives the asset file path and `result.opts`,
and should return the output folder.

Urls are transformed based on the destination.

