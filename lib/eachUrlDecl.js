import { map as asyncMap } from 'async-array-methods'

export default function (root, next) {
  let urlDecls = []
  root.walkDecls(function (decl) {
    if (decl.value && /\burl\(/.test(decl.value)) {
      urlDecls.push(decl)
    }
  })
  return asyncMap(urlDecls, next)
}

