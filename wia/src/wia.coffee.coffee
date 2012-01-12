fs           = require('fs')
eco          = require('eco')
uglify       = require('uglify-js')
compilers    = require('./wia.compilers')
stitch       = require('../assets/stitch')
Dependency   = require('./wia.dependency')
Stitch       = require('./wia.stitch')
{log, toArray}      = require('./wia.utils')

class Package
  constructor: (config = {}) ->
    @identifier   = config.identifier ? 'require'
    @scripts      = toArray(config.scripts)
    @paths        = toArray(config.paths)
    @dependencies = toArray(config.dependencies)

  compileModules: ->
    @dependency or= new Dependency(@dependencies)
    @stitch       = new Stitch(@paths)
    @modules      = @dependency.resolve().concat(@stitch.resolve())
    stitch(identifier: @identifier, modules: @modules)
    
  compileLibs: ->
    content = []
    for path in @scripts
      content.push fs.readFileSync(path, 'utf8')
      err = false
      log {h: 'Coffee', message: 'Compile JS Lib', target: path, success: not err, error: err}
    content.join("\n")
    
  compile: (compress = false) ->
    content = [@compileLibs(), @compileModules()].join("\n")
    err = false
    log {h: 'Coffee', message: 'Compile JS Application', target: '/js/app.js', success: not err, error: err}
    if compress
      content = uglify(content) 
      err = false
      log {h: 'Coffee', message: 'Compress JS', target: '/js/app.js', success: not err, error: err}
    content
    
  createServer: ->
    (req, res, next) =>
      log {m: 'HTTP', h: 'GET', target: '/js/app.js'}
      content = @compile()
      res.writeHead 200, 'Content-Type': 'text/javascript'
      res.end content
      log {h: ['->','Dynamic'], message: 'Build', target: '/js/app.js', success: true, nl: true}

module.exports = 
  compilers:  compilers
  Package:    Package
  createPackage: (config) -> 
    new Package(config)