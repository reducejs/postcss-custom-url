'use strict'

const test = require('tap').test
const custom = require('../lib/custom')
const path = require('path')
const postcss = require('postcss')
const util = require('../lib/util')
const Result = require('../lib/result')
const del = require('del')

const fixtures = path.resolve.bind(path, __dirname, 'fixtures')

test('custom', function(t) {
  let url = custom([
    [ util.inline, { maxSize: 10 } ],
    [function (result, base) {
      if (result.url.slice(0, 5) === 'data:') return

      result.url = path.join(base, path.basename(result.url))
    }, 'i'],
    'copy',
  ])
  let body = '.a{ background-image: url(images/octocat_setup.png) url(images/octocat_fork.png); }'
  let expectedBody = [ '.a{background-image:url(', ')url(i/octocat_fork.png);}' ]
  return del(fixtures('build'))
    .then(function () {
      return Result.dataUrl(fixtures('images', 'octocat_setup.png'))
    })
    .then(function (dataUrl) {
      expectedBody.splice(1, 0, dataUrl)
      expectedBody = expectedBody.join('')
      return postcss(url)
        .process(body, {
          from: fixtures('a.css'),
          to: fixtures('build', 'css', 'a.css'),
        })
    })
    .then(function (result) {
      t.equal(result.css.replace(/\s+/g, ''), expectedBody, 'should inline and transform url')
      return Promise.all([
        Result.dataUrl(fixtures('build', 'css/i', 'octocat_fork.png')),
        Result.dataUrl(fixtures('images', 'octocat_fork.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should copy')
    })
})

