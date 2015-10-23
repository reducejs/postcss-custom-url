import postcss from 'postcss'
import custom from './custom'
import * as util from './util'

var url = postcss.plugin(
  'postcss-custom-url',
  function (customTransforms) {
    customTransforms = customTransforms || [ util.rebase ]
    if (!Array.isArray(customTransforms)) {
      customTransforms = [ customTransforms ]
    }
    return custom(customTransforms)
  }
)

url.util = util

export default url

