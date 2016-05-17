'use strict'

const test = require('tap').test
const Result = require('../lib/result')

test('return false', function (t) {
  var result = new Result('i/a.png', { from: '/path/to/style.css' })
  return result.transform([
    r => { r.url = 'x/a.png' },
    r => {
      r.url = 'y/a.png'
      return false
    },
    r => { r.url = 'z/a.png' },
  ])
  .then(() => t.equal(result.url, 'y/a.png'))
})

