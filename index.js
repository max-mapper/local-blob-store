var blobs = require('content-addressable-store')
var debug = require('debug')('local-blob-store')

module.exports = function(opts) {
  var store = blobs(opts.path, opts.hasher || 'sha256')
  return new BlobStore(store)
}

function BlobStore(store) {
  this.store = store
}

BlobStore.prototype.createWriteStream = function(options, cb) {
  var self = this
  
  if (typeof cb === 'undefined') {
    cb = options
    options = {}
  }
  
  var ws = this.store.addStream(options)
  var errored = false
  
  ws.on('error', function(e) {
    debug('writeStream error', e)
    errored = true
    cb(e)
  })
  
  ws.on('close', function() {
    var hash = ws.hash
    debug('writeStream close', hash)
    if (errored) return
    // does an fs.stat internally
    self.store.has(hash, function(err, stat) {
      if (err) return cb(err)
      cb(null, {hash: hash, size: stat.size})
    })
  })
  
  return ws
}

BlobStore.prototype.createReadStream = function(options) {
  return this.store.getStream(options.hash)
}

BlobStore.prototype.exists = function(options, cb) {
  this.store.has(options.hash, function(err, stat) {
    var exists
    if (err && err.code === 'ENOENT') exists = false
    else if (err) return cb(err)
    else exists = true
    cb(null, exists)
  })
}
