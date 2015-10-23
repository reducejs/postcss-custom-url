import postcss from 'postcss'
import custom from './custom'
import { rebase } from './util'

var id = 0

export default function (name, customTransforms) {
  if (typeof name !== 'string') {
    customTransforms = name
    name = 'postcss-custom-url-' + id++
  }
  return postcss.plugin(
    name,
    custom.bind(null, customTransforms || [ rebase ])
  )
}

