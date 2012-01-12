{existsSync, dirname} = require('path')
jade                  = require('jade')
fs                    = require('fs')
{log}      = require('./wia.utils')

class Jade
  constructor: (@path = '', @obj = {}) ->
    if existsSync(@path + ".jade") then @path += ".jade" 
    else if existsSync(@path + ".html") then @path += ".html" 
    else 
      log {h: 'Jade', message: 'Compile Html', target: @path, error: "["+@path+".jade | "+@path+".html] : Not found"}
      throw ''
    
  compile: (compress = false) ->
    content = fs.readFileSync(@path, 'utf-8')
    result = jade.compile content,
      filename: @path 
      pretty: not compress
      compileDebug: not compress
    err = false
    log {h: 'Jade', message: 'Compile Html', target: @path, success: not err, error: err}
    result(@obj)
    
  createServer: ->
    (req, res, next) =>
      log {m: 'HTTP', h:'GET', target: '/index.html'}      
      content = @compile()
      res.writeHead 200, 'Content-Type': 'text/html'
      res.end content
      log {h: ['->', 'Dynamic'], message: 'Build', target: '/index.html', success: true, nl: true}
      
module.exports = 
  Jade: Jade
  createPackage: (path) ->
    new Jade(path)
    