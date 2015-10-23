import custom from './custom'
import * as util from './util'
import createPlugin from './createPlugin'

var url = createPlugin(
  'postcss-custom-url',
  [ util.inline, util.copy ]
)

url.custom = custom
url.util = util
url.plugin = createPlugin

export default url

