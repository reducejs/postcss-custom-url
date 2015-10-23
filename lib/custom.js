import mix from 'util-mix'
import url from 'url'
import path from 'path'

import eachUrlDecl from './eachUrlDecl'
import applyTransform from './applyTransform'
import { isRelative, trim } from './util'

export default function (customTransforms, opts) {
  return function (root, result) {
    let postcssOpts = result.opts
    let from = postcssOpts.from
    if (!from) {
      return result.warn(
        'postcss-custom-url requires postcss "from" option.'
      )
    }
    let urlOpts = mix({ to: from }, postcssOpts, opts)

    return eachUrlDecl(root, function (decl) {
      let parts = decl.value.split(/\burl\((.*?)\)/)
      return Promise.all(
        parts.map(function (value, i) {
          if (i % 2 === 0) {
            return Promise.resolve(value)
          }
          value = trim(value)
          if (!value) {
            result.warn(
              'postcss-custom-url empty `url()` in ' + from
            )
            return Promise.resolve('url()')
          }
          let assetFile
          if (isRelative(value)) {
            assetFile = path.resolve(
              path.dirname(from),
              url.parse(value).pathname
            )
          }
          let urlResult = {
            file: assetFile,
            url: value,
            opts: urlOpts,
          }
          return applyTransform(customTransforms, urlResult)
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

