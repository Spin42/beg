url   = require "url"
http  = require "http"
https = require "https"

request = (options, {secure, parseJson, binary}, callback) ->
  if (secure? and secure) or (/^https:\/\//.test options) 
    client = https
  else
    client = http
  
  req = client.request options, (res) ->
    res.on "error", (err) ->
      callback err

    response = ""
    res.setEncoding("binary") if binary? and binary
    res.on "data", (chunk) ->
      response += chunk

    res.on "end", ->
      response = JSON.parse response if parseJson?

      callback null, response

  req.on "error", (err) ->
    callback err

  if options.payload? and (options.method is "POST" or options.method is "PUT")
    body = JSON.stringify options.payload
    req.write(body) 

  req.end()

get = (options, parseJson, callback) ->
  request options, parseJson, callback

post = (options, parseJson, callback) ->
  options.method = "POST"
  request options, parseJson, callback

put = (options, parseJson, callback) ->
  options.method = "PUT"
  request options, parseJson, callback

del = (options, parseJson, callback) ->
  options.method = "DELETE"
  request options, parseJson, callback

module.exports =
  get: get
  post: post
  put: put
  del: del