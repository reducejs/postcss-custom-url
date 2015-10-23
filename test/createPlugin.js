import test from 'tape'
import postcss from 'postcss'
import url from '..'

test('createPlugin', function(t) {
  let plugin = url.plugin()
  return postcss(plugin())
    .process('.a { background: url(i/a.png); }', {
      from: '/path/to/src/css/a.css',
      to: '/path/to/build/css/a.css',
    })
    .then(function (result) {
      t.equal(
        result.css,
        '.a { background: url(../../src/css/i/a.png); }'
      )
    })
})

