# postcss-custom-url
[![version](https://img.shields.io/npm/v/postcss-custom-url.svg)](https://www.npmjs.org/package/postcss-custom-url)
[![status](https://travis-ci.org/reducejs/postcss-custom-url.svg?branch=master)](https://travis-ci.org/reducejs/postcss-custom-url)
[![dependencies](https://david-dm.org/reducejs/postcss-custom-url.svg)](https://david-dm.org/reducejs/postcss-custom-url)
[![devDependencies](https://david-dm.org/reducejs/postcss-custom-url/dev-status.svg)](https://david-dm.org/reducejs/postcss-custom-url#info=devDependencies)
[![license](https://img.shields.io/npm/l/postcss-custom-url.svg)](https://www.npmjs.org/package/postcss-custom-url)
[![node](https://img.shields.io/node/v/postcss-custom-url.svg)](https://www.npmjs.org/package/postcss-custom-url)

Transform `url()` in css.

## Usage

```javascript
var url = require('postcss-custom-url')
var util = url.util

var postcss = require('postcss')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')

postcss(url([
  [ util.inline, { maxSize: 5 } ],
  // equivalent with util.copy
  [ 'copy', { assetOutFolder: fixtures('build', 'images') } ],
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

An array of transforms.

If an element is not a function,
it should be the name of a method exported by `util`:
`'copy'`, `'inline'`, `'rebase'`.

### transforms

Type: `Function`, `Array`

Signature: `transformFn(result, ...args)`

Function to transform url,
through modifying  `result.url`

If `Array`, the first element should be the transform function,
and elements after the first will be treated as its arguments `args`.

#### result

Type: `Result`

## Result

Properties and methods:

* `url`: `String`
* `from`: The CSS source path
* `to`: The CSS destination path
* `file`: The asset source path
* `asset`: `Asset`.
* `isRelative()`: `Function`
* `Result.getFile(url, opts)`. Return the `file` property.
* `Result.dataUrl(file)`

## Asset

Properties and methods:

* `mimeType`
* `size()`: Return a promise to get the size of the asset
* `data()`: Return a promise to get the contents of the asset
* `shasum()`: Return a promise to get the sha1 of the contents of the asset
* `base64()`: Return a promise to get the base64 of the contents of the asset
* `dataUrl()`: Return a promise to get the data url of the asset

## util

A group of transform methods.

### rebase

Transform `result.url` according to `result.to`

### inline

Transform `result.url` to data-url.

Options:

* `maxSize`: `Number`, default: `10`. Specify the maximum file size to inline (in kbytes)

### copy

Copy asset files to proper destinations and transform `result.url`.

Options:

* `useHash`: `Boolean`, default: `false`. If `true`, assets are renamed by their sha1 hashes.
* `name`: `String`, default: `null`. Specify how to rename the asset. It only works when `useHash` is false. Special patterns:
  * `[name]`: replaced with the basename of the asset, without the extension.
  * `[hash]`: replaced with the hash
* `assetOutFolder`: `String`, `Function`. Specify the destination where assets should be copied.
  If `Function`, it receives the asset file path and `result.opts`, and should return the output folder.
  Urls are transformed based on the destination, unless `baseUrl` is specified.
* `baseUrl`: `String`, default: `null`. Specify the base url for assets.

```js
var url = require('postcss-custom-url')
var postcss = require('postcss')

postcss(url([
  [
    'copy',
    {
      // copy images to /path/to/build/images
      // since the final css file is /path/to/build/css/style.css,
      // url is set to ../images/octocat_setup.84f6371.png
      assetOutFolder: '/path/to/build/images',

      // rename images like octocat_setup.84f6371.png
      name: '[name].[hash]',

      // if set to true, all images are named after `[hash]`
      // useHash: true,

      // if specified, reset url to i/octocat_setup.84f6371.png
      // baseUrl: 'i',
    },
  ],
]))
.process(
  '.a{ background-image: url(images/octocat_setup.png); }',
  { from: '/path/to/src/style.css', to: '/path/to/build/css/style.css' }
)
.then(function (result) {
  console.log(result.css)
  // '.a{ background-image: url(../images/octocat_setup.png); }'
})

```

