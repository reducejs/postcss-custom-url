import Url from 'url'
import path from 'path'
import Asset from './asset'

export default class Result {
  constructor(url, opts) {
    this._url = trim(url)
    this.opts = opts
    this._file = Result.getFile(url, opts)
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
    customTransforms.forEach((tr) => {
      if (Array.isArray(tr)) {
        tr = tr.slice()
        tr.splice(1, 0, this)
        trs.push(tr)
      } else {
        trs.push([tr, this])
      }
    })
    return trs.reduce(function (p, tr) {
      return p.then(function () {
        let r = tr[0].apply(null, tr.slice(1))
        if (r && typeof r.then === 'function') {
          return r
        }
        return Promise.resolve()
      })
    }, Promise.resolve())
  }

  isEmpty() {
    return !this.url
  }

  hasProtocal() {
    return /^[a-z]+:\/\//.test(this.url)
  }

  isAbsolute() {
    return this.url.slice(0, 1) === '/'
  }

  isDataUrl() {
    return this.url.slice(0, 5) === 'data:'
  }

  isHash() {
    return this.url.slice(0, 1) === '#'
  }

  isRelative() {
    return !(
      this.hasProtocal() ||
      this.isAbsolute() ||
      this.isDataUrl() ||
      this.isHash()
    )
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
