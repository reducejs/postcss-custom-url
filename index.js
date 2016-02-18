'use strict'

const postcss = require('postcss')
const custom = require('./lib/custom')
const util = require('./lib/util')

module.exports = postcss.plugin(
  'postcss-custom-url',
  function (customTransforms) {
    customTransforms = customTransforms || [ util.rebase ]
    if (!Array.isArray(customTransforms)) {
      customTransforms = [ customTransforms ]
    }
    return custom(customTransforms)
  }
)

module.exports.util = util
