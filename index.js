/*
 * CouchDB Worker Fetch JSON
 * 
 * A hoodie worker that fetches a remote JSON and inserts it into a document.
 *
 * Author: Johannes J. Schmidt
 * (c) null2 GmbH, 2012
 * MIT Licensed
 */

var Worker = require("couchdb-worker");
var request = require("request");
var util = require("util");

new Worker.pool({
  name: 'fetch-json',
  server: process.env.HOODIE_SERVER || "http://127.0.0.1:5984",
  timeout: 1000,
  processor: {
    check: function(doc) {
      return doc._id.match(/^\d+$/);
    },
    process: function(doc, done) {
      request({
        url: util.format(this.config.url, doc._id),
        json: true
      }, function(error, resp, data) {
        if (error !== null) return done(error);
        if (resp.statusCode >= 400) return done(resp.statusCode, { error: data });

        done(null, data);
      });
    }
  }
});
