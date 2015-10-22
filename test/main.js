import test from 'tape'
import url from '../lib/main'
import path from 'path'
import del from 'del'
import postcss from 'postcss'
import { base64 } from '../lib/util'

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')

test('main', function(t) {
  let unchanged = '.b{c:url(http://a);d:url(data:image/png;base64,,,)}'
  let body = unchanged + '.a{ background-image: url(images/octocat_setup.png) url(images/octocat_fork.png); }'
  let expectedBody = [ unchanged + '.a{background-image:url(', ')url(../images/octocat_fork.png);}' ]
  return del(fixtures('build'))
    .then(function () {
      return base64(fixtures('images', 'octocat_setup.png'))
    })
    .then(function (dataUrl) {
      expectedBody.splice(1, 0, dataUrl)
      expectedBody = expectedBody.join('')
      return postcss(url({
        maxSize: 10,
        assetOutFolder: fixtures('build', 'images'),
      }))
      .process(
        body,
        { from: fixtures('a.css'), to: fixtures('build', 'css', 'a.css') }
      )
    })
    .then(function (result) {
      t.equal(result.css.replace(/\s+/g, ''), expectedBody, 'should inline and transform url')
      return Promise.all([
        base64(fixtures('build', 'images', 'octocat_fork.png')),
        base64(fixtures('images', 'octocat_fork.png')),
      ])
    })
    .then(function (urls) {
      t.equal(urls[0], urls[1], 'should copy')
    })
})

