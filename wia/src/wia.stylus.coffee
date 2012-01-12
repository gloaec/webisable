{existsSync, dirname} = require('path')
stylus = require('stylus')
fs     = require('fs')
{log}  = require('./wia.utils')

class Stylus
  constructor: (@path = '') ->
    @path += ".styl" if existsSync(@path + ".styl")
    @path += ".css"  if existsSync(@path + ".css")
    
  compile: (compress = false) ->
    content = fs.readFileSync(@path, 'utf-8')

    result = ''
    stylus(content)
      .include(dirname(@path))
      .set('compress', compress)
      .render((err, css) -> 
        log {h: 'Stylus', message: 'Compile CSS', target: @path, success: not err, error: err}
        throw err if err
        result = css
      )
      result
    
  createServer: ->
    (req, res, next) =>
      log {m: 'HTTP', h:'GET', target: '/css/app.css'}
      content = @compile()
      res.writeHead 200, 'Content-Type': 'text/css'
      res.end content
      log {h: ['->', 'Dynamic'], message: 'Build', target: '/css/app.css', success: true, nl: true}
      
module.exports = 
  Stylus: Stylus
  createPackage: (path) ->
    new Stylus(path)