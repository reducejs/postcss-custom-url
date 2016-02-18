'use strict'

const test = require('tap').test
const util = require('../lib/util')
const Result = require('../lib/result')
const path = require('path')
const del = require('del')

const fixtures = path.resolve.bind(path, __dirname, 'fixtures')

test('rebase', function(t) {
  let result = new Result('i/a.png', {
    from: '/path/to/src/css/a.css',
    to: '/path/to/build/css/a.css',
  })
  util.rebase(result)
  t.equal(result.url, '../../src/css/i/a.png')
  t.end()
})

test('inline', function(t) {
  let url = 'images/octocat_setup.png'
  let result = new Result(url, { from: fixtures('a.css') })
  return util.inline(result)
    .then(function () {
      return Result.dataUrl(result.file)
    })
    .then(function (dataUrl) {
      t.equal(result.url, dataUrl, 'should inline')
    })
    .then(function () {
      result.url = url
      return util.inline(result, { maxSize: 4 })
        .then(function () {
          t.equal(result.url, url, 'should not inline')
        })
    })
})

test('copy, string `assetOutFolder`', function(t) {
  let result = new Result('images/octocat_setup.png', {
    from: fixtures('a.css'),
    to: fixtures('build', 'css', 'a.css'),
  })
  let dest = fixtures('build', 'images', 'octocat_setup.png')
  return del(dest)
    .then(function () {
      return util.copy(result, {
        assetOutFolder: fixtures('build', 'images'),
      })
    })
    .then(function () {
      t.equal(result.url, '../images/octocat_setup.png', 'should transform url')
      let assetFile = path.resolve(
        path.dirname(result.to), result.url
      )
      t.equal(assetFile, dest, 'should write to correct path')
      return Promise.all([
        Result.dataUrl(assetFile),
        Result.dataUrl(fixtures('images', 'octocat_setup.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should write the correct contents')
    })
})

test('copy, function `assetOutFolder`', function(t) {
  let result = new Result('images/octocat_setup.png', {
    from: fixtures('a.css'),
    to: fixtures('build', 'css', 'a.css'),
  })
  let dest = fixtures('build', 'css', 'i', 'octocat_setup.png')
  return del(dest)
    .then(function () {
      return util.copy(result, {
        assetOutFolder: function (file, opts) {
          return path.dirname(
            path.join(path.dirname(opts.to), 'i', path.basename(file))
          )
        },
      })
    })
    .then(function () {
      t.equal(result.url, 'i/octocat_setup.png', 'should transform url')
      let assetFile = path.resolve(
        path.dirname(result.to), result.url
      )
      t.equal(assetFile, dest, 'should write to correct path')
      return Promise.all([
        Result.dataUrl(assetFile),
        Result.dataUrl(fixtures('images', 'octocat_setup.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should write the correct contents')
    })
})

test('copy, default `assetOutFolder`', function(t) {
  let result = new Result('images/octocat_setup.png', {
    from: fixtures('a.css'),
    to: fixtures('build', 'css', 'a.css'),
  })
  let dest = fixtures('build', 'css', 'images', 'octocat_setup.png')
  return del(dest)
    .then(function () {
      return util.copy(result)
    })
    .then(function () {
      t.equal(result.url, 'images/octocat_setup.png', 'should not transform url')
      let assetFile = path.resolve(
        path.dirname(result.to), result.url
      )
      t.equal(assetFile, dest, 'should write to correct path')
      return Promise.all([
        Result.dataUrl(assetFile),
        Result.dataUrl(fixtures('images', 'octocat_setup.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should write the correct contents')
    })
})

test('copy, `useHash`', function(t) {
  let result = new Result('images/octocat_setup.png', {
    from: fixtures('a.css'),
    to: fixtures('build', 'css', 'a.css'),
  })
  return del(fixtures('build'))
    .then(function () {
      return util.copy(result, {
        useHash: true,
      })
    })
    .then(function () {
      t.equal(result.url, 'images/84f6371.png', 'should not transform url')
      let assetFile = path.resolve(
        path.dirname(result.to), result.url
      )
      t.equal(assetFile, fixtures('build', 'css', 'images', '84f6371.png'), 'should write to correct path')
      return Promise.all([
        Result.dataUrl(assetFile),
        Result.dataUrl(fixtures('images', 'octocat_setup.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should write the correct contents')
    })
})

test('copy, `name`', function(t) {
  let result = new Result('images/octocat_setup.png', {
    from: fixtures('a.css'),
    to: fixtures('build', 'css', 'a.css'),
  })
  return del(fixtures('build'))
    .then(function () {
      return util.copy(result, {
        name: '[name].[hash]',
      })
    })
    .then(function () {
      t.equal(result.url, 'images/octocat_setup.84f6371.png', 'should not transform url')
      let assetFile = path.resolve(
        path.dirname(result.to), result.url
      )
      t.equal(assetFile, fixtures('build', 'css', 'images', 'octocat_setup.84f6371.png'), 'should write to correct path')
      return Promise.all([
        Result.dataUrl(assetFile),
        Result.dataUrl(fixtures('images', 'octocat_setup.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should write the correct contents')
    })
})

