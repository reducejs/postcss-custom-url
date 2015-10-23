import test from 'tape'
import { inline, copy, rebase } from '../lib/util'
import Result from '../lib/result'
import path from 'path'
import del from 'del'

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')

test('rebase', function(t) {
  let result = new Result('i/a.png', {
    from: '/path/to/src/css/a.css',
    to: '/path/to/build/css/a.css',
  })
  rebase(result)
  t.equal(result.url, '../../src/css/i/a.png')
  t.end()
})

test('inline', function(t) {
  let url = 'images/octocat_setup.png'
  let result = new Result(url, { from: fixtures('a.css') })
  t.task(function () {
    return inline(result)
      .then(function () {
        return Result.dataUrl(result.file)
      })
      .then(function (dataUrl) {
        t.equal(result.url, dataUrl, 'should inline')
      })
  })
  t.task(function () {
    result.url = url
    return inline(result, { maxSize: 4 })
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
      return copy(result, {
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
      return copy(result, {
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
      return copy(result)
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
      return copy(result, {
        useHash: true,
      })
    })
    .then(function () {
      t.equal(result.url, 'images/84f6371ecad812ad78859b234943b5c8152e7fdb.png', 'should not transform url')
      let assetFile = path.resolve(
        path.dirname(result.to), result.url
      )
      t.equal(assetFile, fixtures('build', 'css', 'images', '84f6371ecad812ad78859b234943b5c8152e7fdb.png'), 'should write to correct path')
      return Promise.all([
        Result.dataUrl(assetFile),
        Result.dataUrl(fixtures('images', 'octocat_setup.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should write the correct contents')
    })
})

