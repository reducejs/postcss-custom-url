'use strict'

const test = require('tap').test
const url = require('..')
const path = require('path')
const del = require('del')
const postcss = require('postcss')
const util = require('../lib/util')
const Result = require('../lib/result')

const fixtures = path.resolve.bind(path, __dirname, 'fixtures')

test('main', function(t) {
  let unchanged = '.b{c:url(http://a);d:url(data:image/png;base64,,,)}'
  let body = unchanged + '.a{ background-image: url("images/octocat_setup.png") url(images/octocat_fork.png); }'
  let expectedBody = [ unchanged + '.a{background-image:url(', ')url(../images/octocat_fork.png);}' ]
  return del(fixtures('build'))
    .then(function () {
      return Result.dataUrl(fixtures('images', 'octocat_setup.png'))
    })
    .then(function (dataUrl) {
      expectedBody.splice(1, 0, dataUrl)
      expectedBody = expectedBody.join('')
      return postcss(url([
        [ util.inline, { maxSize: 10 } ],
        [ util.copy, { assetOutFolder: fixtures('build', 'images') } ],
      ]))
      .process(
        body,
        { from: fixtures('a.css'), to: fixtures('build', 'css', 'a.css') }
      )
    })
    .then(function (result) {
      t.equal(result.css.replace(/\s+/g, ''), expectedBody, 'should inline and transform url')
      return Promise.all([
        Result.dataUrl(fixtures('build', 'images', 'octocat_fork.png')),
        Result.dataUrl(fixtures('images', 'octocat_fork.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should copy')
    })
})

