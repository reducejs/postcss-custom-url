import mix from 'util-mix'
import url from 'url'
import path from 'path'

import eachUrlDecl from './eachUrlDecl'
import applyTransform from './applyTransform'

export default function (customTransforms, opts) {
  return function (root, result) {
    let postcssOpts = result.opts
    let from = postcssOpts.from
    if (!from) {
      return result.warn('postcss-custom-url requires postcss "from" option.')
    }
    let urlOpts = mix({ to: from }, postcssOpts, opts)

    return eachUrlDecl(root, function (decl) {
      let parts = decl.value.split(/\burl\((.*?)\)/)
      return Promise.all(parts.map(function (str, i) {
        if (i % 2 === 0) {
          return Promise.resolve(str)
        }
        return handleUrlDecl(str, urlOpts, customTransforms)
      }))
      .then(function (transformedParts) {
        decl.value = transformedParts.join('')
      })
    })
  }
}

function handleUrlDecl(value, urlOpts, customTransforms) {
  value = trim(value)
  if (!validate(value)) {
    return Promise.resolve('url(' + value + ')')
  }
  let result = {
    file: path.resolve(
      path.dirname(urlOpts.from),
      url.parse(value).pathname
    ),
    url: value,
    opts: urlOpts,
  }
  return applyTransform(customTransforms, result).then(function () {
    return 'url(' + result.url + ')'
  })
}

function validate(s) {
  return !(
    !s ||
    s[0] === '/' ||
    s.slice(0, 5) === 'data:' ||
    s[0] === '#' ||
    /^[a-z]+:\/\//.test(s)
  )
}

function trim(s) {
  return s && s.trim().replace(/['"]/g, '').trim()
}

