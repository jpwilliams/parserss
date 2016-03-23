'use strict';

var FeedParser = require('feedparser');

function parse (src, max, callback) {
  var parser = new FeedParser();
  var c = 0;

  src.pipe(parser);

  if (max == null)
    max = 10;

  var res = {
    meta: {},
    articles: []
  };

  parser.on('error', function (err) {
    return callback(err);
  });

  parser.on('readable', function () {
    var stream = this;
    res.meta = this.meta;
    var item;

    while (item = stream.read()) {
      c += 1;
      if (c <= max || max === 0)
        res.articles.push(item);
    }

    if (c === max && max !== 0)
      return callback(null, res);
  });

  parser.on('end', function () {
    if (c <= max && max !== 0)
      return callback(null, res);
  });
}

function getUrl (url, max, callback) {
  var request = require('request');
  var Iconv = require('iconv').Iconv;

  var req = request({
    method: 'GET',
    uri: url
  });

  req.on('response', function (response) {
    var stream = this
        , iconv
        , charset;

    if (response.statusCode !== 200)
      return this.emit('error', new Error('Bad status code'));

    charset = getParams(res.headers['content-type'] || '').charset;
    if (!iconv && charset && !/utf-*8/i.test(charset)) {
        try {
            iconv = new Iconv(charset, 'utf-8');
            iconv.on('error', done);
            stream = this.pipe(iconv);
        } catch(err) {
            this.emit('error', err);
        }
    }

    parse(stream, max, callback);
  });

  req.on('error', function (err) {
    return callback(err);
  });
}

function getFile (path, max, callback) {
  var file = require('fs').createReadStream(path);
  parse(file, max, callback);
}

module.exports = getUrl;
module.exports.parse = parse;
module.exports.getUrl = getUrl;
module.exports.getFile = getFile;
