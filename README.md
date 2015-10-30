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
var util = url.util

var postcss = require('postcss')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')

postcss(url([
  [ util.inline, { maxSize: 5 } ],
  [ util.copy, { assetOutFolder: fixtures('build', 'images') } ],
]))
.process(
  '.a{ background-image: url(images/octocat_setup.png); }',
  { from: fixtures('a.css'), to: fixtures('build', 'css', 'a.css') }
)
.then(function (result) {
  console.log(result.css)
  // '.a{ background-image: url(../images/octocat_setup.png); }'
})

```

## url(customTransforms)

### customTransforms

Type: `Array`

Default: `[ util.rebase ]`

An array of transforms

### transforms

Type: `Function`, `Array`

Signature: `transformFn(result, ...args)`

Function to transform url,
through modifying  `result.url`

If `Array`, `args` will be the elements from the second.

#### result

Type: `Result`

## Result

### url

Type: `String`

### from

The CSS source path

### to

The CSS destination path

### file

The asset source path

### asset

Type: `Asset`

### isRelative()

### Result.getFile(url, opts)

### Result.dataUrl(file)

## Asset

### mimeType

### size()

Return a promise to get the size of the asset

### data()

Return a promise to get the contents of the asset

### shasum()

Return a promise to get the sha1 of the contents of the asset

### base64()

Return a promise to get the base64 of the contents of the asset

### dataUrl()

Return a promise to get the data url of the asset

## util

A group of transform methods.

### rebase

Transform `result.url` according to `result.to`


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

