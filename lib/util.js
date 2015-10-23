import path from 'path'
import fs from 'fs'
import promisify from 'node-promisify'

var fsWrite = promisify(fs.writeFile)
var mkdirp = promisify(require('mkdirp'))

export function rebase(result) {
  if (result.isRelative()) {
    result.url = path.relative(
      path.dirname(result.to), result.file
    )
  }
}

export function inline(result, opts = {}) {
  let asset = result.asset
  if (!result.isRelative() || !asset.mimeType) {
    return
  }

  let maxSize = opts.maxSize === undefined ? 10 : opts.maxSize
  maxSize <<= 10

  return asset.size()
    .then(function (size) {
      if (size >= maxSize) {
        return
      }
      return asset.dataUrl()
        .then(function (dataUrl) {
          result.url = dataUrl
        })
    })
}

export function copy(result, opts = {}) {
  if (!result.isRelative()) {
    return
  }

  let assetFolder = opts.assetOutFolder
  if (typeof assetFolder === 'function') {
    assetFolder = assetFolder(result.file, result.opts)
  }
  if (typeof assetFolder === 'string') {
    assetFolder = path.resolve(assetFolder)
  } else {
    assetFolder = path.dirname(
      path.resolve(path.dirname(result.to), result.url)
    )
  }

  return mkdirp(assetFolder)
    .then(function () {
      if (opts.useHash) {
        return result.asset.shasum().then(function (shasum) {
          return shasum + path.extname(result.file)
        })
      }
      return path.basename(result.file)
    })
    .then(function (basename) {
      let assetFile = path.join(assetFolder, basename)
      result.url = path.relative(
        path.dirname(result.to), assetFile
      )
      return result.asset.data().then(function (buf) {
        return fsWrite(assetFile, buf)
      })
    })

}

