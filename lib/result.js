'use strict'

const Url = require('url')
const path = require('path')
const Asset = require('./asset')
const util = require('./util')

class Result {
  constructor(url, opts) {
    this.url = url
    this.opts = opts
    this._file = Result.getFile(this.url, opts)
    this.asset = new Asset(this.file)
  }

  get url() {
    return this._url
  }

  set url(value) {
    this._url = trim(value)
  }

  get from() {
    return this.opts.from
  }

  get to() {
    return this.opts.to || this.opts.from
  }

  get file() {
    return this._file
  }

  transform(customTransforms) {
    let trs = []
    customTransforms = customTransforms || []
    customTransforms.forEach(tr => {
      if (Array.isArray(tr)) {
        tr = tr.slice()
        tr.splice(1, 0, this)
        trs.push(tr)
      } else {
        trs.push([tr, this])
      }
    })
    return trs.reduce(function (p, tr) {
      return p.then(function (next) {
        if (next === false) {
          return false
        }
        if (typeof tr[0] === 'string') {
          tr[0] = util[tr[0]]
        }
        return tr[0].apply(null, tr.slice(1))
      })
    }, Promise.resolve())
  }

  isRelative() {
    let obj = Url.parse(this.url)
    return obj.pathname && obj.pathname[0] !== '/'
  }

  static getFile(url, opts) {
    return path.resolve(
      path.dirname(opts.from),
      Url.parse(url).pathname
    )
  }

  static dataUrl(file) {
    let r = new Asset(file)
    return r.dataUrl()
  }
}

function trim(s) {
  return typeof s === 'string' && s.replace(/['"]/g, '').trim()
}

module.exports = Result
