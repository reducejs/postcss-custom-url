import path from 'path'
import fs from 'fs'
import promisify from 'node-promisify'
import mime from 'mime'
import shasum from 'shasum'

var fsStat = promisify(fs.stat)
var fsRead = promisify(fs.readFile)
var fsWrite = promisify(fs.writeFile)
var mkdirp = promisify(require('mkdirp'))

export function hasProtocal(s) {
  return /^[a-z]+:\/\//.test(s)
}

export function isAbsolute(s) {
  return s.slice(0, 1) === '/'
}

export function isDataUrl(s) {
  return s.slice(0, 5) === 'data:'
}

export function isHash(s) {
  return s.slice(0, 1) === '#'
}

export function isRelative(s) {
  return !(
    hasProtocal(s) ||
    isAbsolute(s) ||
    isDataUrl(s) ||
    isHash(s)
  )
}

export function base64(assetFile, mimeType) {
  mimeType = mimeType || mime.lookup(assetFile)
  return fsRead(assetFile).then(function (buf) {
    return 'data:' + mimeType + ';base64,' + buf.toString('base64')
  })
}

export function rebase(result) {
  if (!isRelative(result.url)) {
    return
  }
  let opts = result.opts
  let assetFile = result.file
  result.url = path.relative(
    path.dirname(opts.to), assetFile
  )
}

export function inline(result) {
  if (!isRelative(result.url)) {
    return
  }
  let opts = result.opts
  let maxSize = (opts.maxSize === undefined ? 10 : opts.maxSize) << 10
  let assetFile = result.file

  return fsStat(assetFile)
    .then(function (stats) {
      if (stats.size >= maxSize) {
        return
      }
      let mimeType = mime.lookup(assetFile)
      if (!mimeType) {
        return
      }
      /*
      if (mimeType === 'image/svg+xml') {
        let SvgEncoder = require('directory-encoder/lib/svg-uri-encoder.js')
        let svg = new SvgEncoder(assetFile)
        result.url = svg.encode()
        return
      }
      */
      return base64(assetFile, mimeType).then(function (dataUrl) {
        result.url = dataUrl
      })
    })
}

export function copy(result) {
  if (!isRelative(result.url)) {
    return
  }

  let opts = result.opts
  let assetFile = result.file
  let basename = path.basename(assetFile)

  return fsRead(assetFile).then(function (buf) {
    if (opts.useHash) {
      basename = shasum(buf) + path.extname(basename)
    }

    let assetFolder = opts.assetOutFolder
    if (typeof assetFolder === 'function') {
      assetFolder = assetFolder(assetFile, opts)
    }
    if (typeof assetFolder === 'string') {
      assetFolder = path.resolve(assetFolder)
    } else {
      assetFolder = path.dirname(
        path.resolve(path.dirname(opts.to), result.url)
      )
    }

    return mkdirp(assetFolder).then(function () {
      assetFile = path.join(assetFolder, basename)
      result.url = path.relative(path.dirname(opts.to), assetFile)
      opts.from = opts.to
      return fsWrite(assetFile, buf)
    })
  })
}

export function trim(s) {
  return typeof s === 'string' && s.replace(/['"]/g, '').trim()
}

