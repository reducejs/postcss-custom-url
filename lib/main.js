import postcss from 'postcss'
import custom from './custom'
import * as util from './util'

var url = postcss.plugin(
  'postcss-custom-url',
  custom.bind(null, [ util.inline, util.copy ])
)

url.custom = custom
url.util = util

export default url

