'use strict'

const asyncMap = require('async-array-methods').map

module.exports = function (root, next) {
  let urlDecls = []
  root.walkDecls(function (decl) {
    if (decl.value && /\burl\(/.test(decl.value)) {
      urlDecls.push(decl)
    }
  })
  return asyncMap(urlDecls, next)
}

