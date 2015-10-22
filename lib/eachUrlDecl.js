import { map as asyncMap } from 'async-array-methods'
import promisify from 'node-promisify'

export default promisify(function (root, next, done) {
  let urlDecls = []
  root.walkDecls(function (decl) {
    if (decl.value && /\burl\(/.test(decl.value)) {
      urlDecls.push(decl)
    }
  })
  asyncMap(urlDecls, next, done)
})

