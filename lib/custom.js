import eachUrlDecl from './eachUrlDecl'
import Result from './result'

export default function (customTransforms) {
  return function (root, result) {
    let postcssOpts = result.opts
    if (!postcssOpts.from) {
      return result.warn(
        'postcss-custom-url requires postcss "from" option.'
      )
    }

    return eachUrlDecl(root, function (decl) {
      let parts = decl.value.split(/\burl\((.*?)\)/)
      return Promise.all(
        parts.map(function (value, i) {
          if (i % 2 === 0) {
            return Promise.resolve(value)
          }
          let urlResult = new Result(value, postcssOpts)
          if (urlResult.isEmpty()) {
            result.warn(
              'postcss-custom-url empty `url()` in ' + postcssOpts.from
            )
            return Promise.resolve('url()')
          }
          return urlResult.transform(customTransforms)
            .then(function () {
              return 'url(' + urlResult.url + ')'
            })
        })
      )
      .then(function (transformedParts) {
        decl.value = transformedParts.join('')
      })
    })
  }
}

