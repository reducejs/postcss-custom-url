import { run } from 'callback-sequence'
import promisify from 'node-promisify'

export default promisify(function (customTransforms, result, done) {
  let trs = []
  customTransforms.forEach(function (tr) {
    if (Array.isArray(tr)) {
      trs.push(tr.concat(result))
    } else {
      trs.push([tr, result])
    }
  })
  run(trs, done)
})

