import test from 'tape'
import custom from '../lib/custom'
import path from 'path'
import postcss from 'postcss'
import { base64, inline, copy } from '../lib/util'
import del from 'del'

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')

test('custom', function(t) {
  let url = custom.bind(null, [
    inline,
    [function (base, result) {
      if (result.url.slice(0, 5) === 'data:') {
        return
      }
      result.url = path.join(base, path.basename(result.url))
    }, 'i'],
    copy,
  ])
  let body = '.a{ background-image: url(images/octocat_setup.png) url(images/octocat_fork.png); }'
  let expectedBody = [ '.a{background-image:url(', ')url(i/octocat_fork.png);}' ]
  return del(fixtures('build'))
    .then(function () {
      return base64(fixtures('images', 'octocat_setup.png'))
    })
    .then(function (dataUrl) {
      expectedBody.splice(1, 0, dataUrl)
      expectedBody = expectedBody.join('')
      return postcss(url({
        maxSize: 10,
      }))
      .process(
        body,
        { from: fixtures('a.css'), to: fixtures('build', 'css', 'a.css') }
      )
    })
    .then(function (result) {
      t.equal(result.css.replace(/\s+/g, ''), expectedBody, 'should inline and transform url')
      return Promise.all([
        base64(fixtures('build', 'css/i', 'octocat_fork.png')),
        base64(fixtures('images', 'octocat_fork.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should copy')
    })
})

