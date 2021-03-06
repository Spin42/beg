var url = require("url");
var http = require("http");
var https = require("https");
var querystring = require("querystring");

var DEFAULT_TIMEOUT = 300000;

var _tryParseJSON = function(jsonString) {
  var o;
  try {
    o = JSON.parse(jsonString);
    if (o && typeof o === "object" && o !== null) {
      return o;
    }
  } catch (_error) {}
  return false;
};

var request = function(options, _arg, callback) {
  var secure    = _arg.secure;
  var parseJson = _arg.parseJson;
  var binary    = _arg.binary;
  var client;
  var stringifiedPayload;

  if (((secure != null) && secure) || (/^https:\/\//.test(options))) {
    client = https;
  } else {
    client = http;
  }

  if ((options.payload != null) && (options.method === "POST" || options.method === "PUT")) {
    if (options.headers == null)
      options.headers = {};
    stringifiedPayload = JSON.stringify(options.payload);
    options.headers["Content-Type"]   = "application/json";
    options.headers["Content-Length"] = Buffer.byteLength(stringifiedPayload, "utf8");
  } else if ((options.formData != null) && (options.method === "POST" || options.method === "PUT")) {
    if (options.headers == null)
      options.headers = {};
    options.headers["Content-Type"]   = "application/x-www-form-urlencoded";
    options.headers["Content-Length"] = Buffer.byteLength(querystring.stringify(options.formData), "utf8");
  }

  var timeout = options.timeout || DEFAULT_TIMEOUT;

  var req = client.request(options, function(res) {

    res.on("error", function(err) {
      return callback(err);
    });

    var response = "";

    if ((binary != null) && binary) {
      res.setEncoding("binary");
    }

    res.on("data", function(chunk) {
      response += chunk;
    });

    res.on("end", function() {
      if (parseJson != null && parseJson) {
        response = _tryParseJSON(response);
      }

      if ((parseJson != null) && response === false) {
        return callback(null, {}, res);
      } else {
        return callback(null, response, res);
      }
    });
  });

  req.setTimeout(timeout, function() {
    req.abort();
  });

  req.on("error", function(err) {
    return callback(err);
  });

  if ((options.payload != null) && (options.method === "POST" || options.method === "PUT")) {
    req.write(stringifiedPayload);
  } else if ((options.formData != null) && (options.method === "POST" || options.method === "PUT")) {
    var body = querystring.stringify(options.formData);
    req.write(body);
  }

  req.end();
};

var get = function(options, parseJson, callback) {
  return request(options, parseJson, callback);
};

var post = function(options, parseJson, callback) {
  options.method = "POST";
  return request(options, parseJson, callback);
};

var put = function(options, parseJson, callback) {
  options.method = "PUT";
  return request(options, parseJson, callback);
};

var del = function(options, parseJson, callback) {
  options.method = "DELETE";
  return request(options, parseJson, callback);
};

module.exports = {
  get: get,
  post: post,
  put: put,
  del: del
};
