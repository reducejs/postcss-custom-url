import postcss from 'postcss'
import custom from './custom'
import { inline, copy } from './util'

export default postcss.plugin(
  'postcss-custom-url',
  custom.bind(null, [ inline, copy ])
)

