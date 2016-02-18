'use strict'

const fs = require('fs')
const mime = require('mime')
const shasum = require('shasum')
const promisify = require('node-promisify')

const fsStat = promisify(fs.stat)
const fsRead = promisify(fs.readFile)

class Asset {
  constructor(file) {
    this.file = file
  }

  get mimeType() {
    if (this._mimeType !== undefined) {
      return this._mimeType
    }
    this._mimeType = this.file && mime.lookup(this.file) || ''
    return this._mimeType
  }

  size() {
    if (!this._size) {
      this._size = fsStat(this.file).then(stats => stats.size)
    }
    return this._size
  }

  data() {
    if (!this._data) {
      this._data = fsRead(this.file)
    }
    return this._data
  }

  shasum() {
    if (!this._shasum) {
      this._shasum = this.data().then(shasum)
    }
    return this._shasum
  }

  base64() {
    if (!this._base64) {
      this._base64 = this.data().then(data => data.toString('base64'))
    }
    return this._base64
  }

  dataUrl() {
    if (this._dataUrl) {
      return this._dataUrl
    }
    if (this.mimeType) {
      this._dataUrl = this.base64().then( base64 => {
        return 'data:' + this.mimeType + ';base64,' + base64
      } )
    } else {
      this._dataUrl = Promise.reject(
        new Error('unknown mime type')
      )
    }
    return this._dataUrl
  }

  /*
  svgUrl() {
    if (this._svgUrl) {
      return this._svgUrl
    }
    if (this.mimeType === 'image/svg+xml') {
      let SvgEncoder = require('directory-encoder/lib/svg-uri-encoder.js')
      let svg = new SvgEncoder(this.file)
      this._svgUrl = Promise.resolve(svg.encode())
    }
    return this._svgUrl
  }
  */

}

module.exports = Asset
