var fs = require('fs')
var os = require('os')
var path = require('path')

var test = require('tape')
var rimraf = require('rimraf')
var abstractBlobTests = require('abstract-blob-store/tests')

var blobStore = require('./')
var blobPath = path.join(os.tmpdir(), 'testblobs')

var common = {
  setup: function(t, cb) {
    rimraf(blobPath, function() {
      var store = blobStore({path: blobPath})
      cb(null, store)
    })
  },
  teardown: function(t, store, blob, cb) {
    rimraf(blobPath, cb)
  }
}

abstractBlobTests(test, common)
