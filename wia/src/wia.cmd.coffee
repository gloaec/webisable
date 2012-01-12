fd                          = require('path')
express                     = require('express')
fs                          = require('fs')
{print}                     = require('sys')
{spawn, exec}               = require('child_process')
{watchTree}                 = require('watch-tree')
coffee                      = require('./wia.coffee')
stylus                      = require('./wia.stylus')
jade                        = require('./wia.jade')
Template                    = require('./wia.template')
{expandPath, camelize, log} = require('./wia.utils')


class Cmd
  defaults:
    slug:         './app/app.json'
    index_script: './app/app'#'./public/js/lib/app'
    index_style:  './app/app'#'./public/css/lib/app'
    index_view:   './app/app'#'./public/html/lib/app'
    index_server: './server/lib/server.js'
    js:           []
    css:          []
    public:       './public'
    paths:        ['./app']
    dependencies: ['wia']
    port:         process.env.PORT or 9294
  
  @readSlug: (path) ->
    JSON.parse(fs.readFileSync(path, 'utf-8'))
  
  constructor: (@options = {}) ->
    @options = @readSlug(@options) if typeof @options is 'string'
    @options[key] or= value for key, value of @defaults
    @options.public = fd.resolve(@options.public)
  # --------
  
  build: (argv) ->
    if typeof argv is 'string' then target = argv 
    else target ?= argv._[1]
    
    if target and target isnt ('all' or 'a')
      if      target is ('client' or 'c') then @buildClient()
      else if target is ('server' or 's') then @buildServer()
      else log {target: target, error: "No such building option"}
    else
      @buildClient()
      @buildServer()
      
  buildServer: (watch, callback) ->
    if typeof watch is 'function'
      callback = watch
      watch = false
    sub = exec 'coffee -c -o server/lib server/src', (error, out, err) ->
      log {message: 'Compile Server', error: err, info: out, success: not error}
      callback?() if not error
      
  buildClient: ->
    applicationPath = @options.public + '/js/app.js'
    log {m: 'API', h:'Coffee', message:'Build', target: applicationPath}
    package = @coffeePackage().compile(true)
    fs.writeFileSync(applicationPath, package)
    log {h: ['->', 'Static'], message:'Build', target: applicationPath; success: true, nl: true}
   
    applicationPath = @options.public + '/css/app.css'
    log {m: 'API', h:'Stylus', message:'Build', target: applicationPath}
    package = @stylusPackage().compile(true)
    fs.writeFileSync(applicationPath, package)
    log {h: ['->', 'Static'], message:'Build', target: applicationPath; success: true, nl: true}
   
    applicationPath = @options.public + '/index.html'
    log {m: 'API', h:'Jade', message:'Build', target: applicationPath}
    package = @jadePackage().compile(true)
    fs.writeFileSync(applicationPath, package)
    log {h: ['->', 'Static'], message:'Build', target: applicationPath; success: true, nl: true}
  
  initServer: =>
    S=@
    @buildServer ->
      S.startServer()
      
  startServer: ->    
    install = spawn 'node', [@options.index_server]
    install.stderr.on 'data', (data) ->
      process.stderr.write data.toString()
    install.stdout.on 'data', (data) ->
      print data.toString()
    install.on 'exit', (code) ->
      callback?() if code is 0;
    
  
  static: ->
    log {m: 'SERVER', h: 'Static', message: 'Starting server'}   
    @startServer()
    
  server: ->
    log {m: 'SERVER', h: 'Development', message: 'Starting server'}   
    @initServer()
    log {message: 'Watch Server', info: 'watching…'}
    watcher = watchTree 'server/src', 'sample-rate': 5
    watcher.on 'fileModified', @initServer
    watcher.on 'fileCreated', @initServer
  
  createServer: ->
    @node?.close()  
    exists = true#fd.existsSync(@options.index_server)
    console.log require.paths
    @node = if exists then require(@options.index_server).createServer() else require('express').createServer()
    log {message: 'Load Server', target: @options.index_server, success: exists, error: if exists then false else 'File not found'}
    
    @node.get '/js/app.js', @coffeePackage().createServer() 
    @node.get '/css/app.css', @stylusPackage().createServer()
    @node.get '/index.html', @jadePackage().createServer()
    @node.get '/', @jadePackage().createServer() 
    @node.use express.static(@options.public)
  
  listen: ->
    @node.listen @options.port
    log {message: 'Port', target: @options.port }
    log {message: 'Ctrl+C to shutdown server', info: 'listening…', nl: true}
  
  ###
  
  node: null
  
  buildServer: (watch, callback) ->
    if typeof watch is 'function'
      callback = watch
      watch = false
    sub = exec 'coffee -c -o server/lib server/src', (error, out, err) ->
      log {message: 'Compile Server', error: err, info: out, success: not error}
      callback?() if not error

    opt = ['-c', '-o', './server/lib', './server/src']
    opt.unshift '-w' if watch
    sub = spawn 'coffee', opt, callback
    sub.stdout.on 'data', (data) -> log {message: 'Build Server', target: 'server/lib', info: data.toString()}
    sub.stderr.on 'data', (data) -> log {message: 'Build Server', target: 'server/lib', error: data.toString()}
    sub.on 'exit', (status) ->
      if status is 0 
        log {message: 'Build Server', success: true}
        callback?() 
    sub
    
  startServer: =>
  
    @buildServer =>
      
      @node?.close()
      
      exists = fd.existsSync(@options.index_server)
      @node = if exists then require(@options.index_server) else require('express').createServer()
      log {message: 'Load Server', target: @options.index_server, success: exists, error: if exists then false else 'File not found'}
      
      @node.get('/js/app.js', @coffeePackage().createServer())  
      @node.get('/css/app.css', @stylusPackage().createServer())
      @node.get('/index.html', @jadePackage().createServer())
      @node.get('/', @jadePackage().createServer())
      @node.use(express.static(@options.public))
      log {message: 'Port', target: @options.port }
        
      @node.listen(@options.port)
      log {message: 'Ctrl+C to shutdown server', info: 'listening…', nl: true}
      
  ###
  
  install: (callback) ->
    install = spawn 'npm', ['install']
    install.stderr.on 'data', (data) ->
      process.stderr.write data.toString()
    install.stdout.on 'data', (data) ->
      print data.toString()
    install.on 'exit', (code) ->
      callback?() if code is 0;
  
  ###
  server: ->
    log {m: 'SERVER', h: 'Development', message: 'Starting server'}
    @startServer()      
    log {message: 'Watch Server', info: 'watching…'}
    watcher = watchTree 'server/src', 'sample-rate': 5
    watcher.on 'fileModified', @startServer
    watcher.on 'fileCreated', @startServer
    
  buildClient: ->
    applicationPath = @options.public + '/js/app.js'
    log {m: 'API', h:'Coffee', message:'Build', target: applicationPath}
    package = @coffeePackage().compile(true)
    #console.log(package)
    fs.writeFileSync(applicationPath, package)
    log {h: ['->', 'Static'], message:'Build', target: applicationPath; success: true, nl: true}
   
    applicationPath = @options.public + '/css/app.css'
    log {m: 'API', h:'Stylus', message:'Build', target: applicationPath}
    package = @stylusPackage().compile(true)
    #console.log(package)
    fs.writeFileSync(applicationPath, package)
    log {h: ['->', 'Static'], message:'Build', target: applicationPath; success: true, nl: true}
   
    applicationPath = @options.public + '/index.html'
    log {m: 'API', h:'Jade', message:'Build', target: applicationPath}
    package = @jadePackage().compile(true)
    #console.log(package)
    fs.writeFileSync(applicationPath, package)
    log {h: ['->', 'Static'], message:'Build', target: applicationPath; success: true, nl: true}
    
  static: ->
    log {m: 'SERVER', h: 'Production', message: 'Starting server'}
    
    @buildServer =>
      exists = fd.existsSync(@options.index_server)
      @node = if exists then require(@options.index_server) else require('express').createServer()
      log {message: 'Load Server', target: @options.index_server, success: true}
   
      @node.use(express.static(@options.public))
      log {message: 'Port', target: @options.port}
      @node.listen(@options.port)
      log {message: 'Ctrl+C to shutdown server', info: 'listening…', nl: true}
  
  ###
      
  publish: ->
    @build()
    @static()
    
  app: (argv) ->
    template = __dirname + "/../assets/app"
    path = fd.normalize argv._[1]
    if fd.existsSync(path) then throw path + " already exists"
    fs.mkdirSync path, 0775
    (new Template(template, path)).write()
 
  mobile: (argv) ->
    template = __dirname + "/../assets/mobile"
    path = fd.normalize argv._[1]
    if fd.existsSync(path) then throw path + " already exists"
    fs.mkdirSync path, 0775
    (new Template(template, path)).write()
  
  controller: (argv) ->
    values = camelize fd.basename(argv._[1])
    
    template = __dirname + "/../assets/controller.client.coffee"
    path = expandPath argv._[1], "./app/controllers/"
    if not fd.extname(path) then path += ".coffee"
    (new Template(template, path, values)).write()
    console.log '-> Generated: '+path
    template = __dirname + "/../assets/controller.server.coffee"
    path = expandPath argv._[1], "./server/src/controllers/"
    if not fd.extname(path) then path += ".coffee"
    (new Template(template, path, values)).write()
    console.log '-> Generated: '+path
    
  model: (argv) ->
    values = camelize fd.basename(argv._[1])
    
    template = __dirname + "/../assets/model.client.coffee"
    path = expandPath argv._[1], "./app/models/"
    if not fd.extname(path) then path += ".coffee"
    (new Template(template, path, values)).write()
    console.log '-> Generated: '+path
    template = __dirname + "/../assets/model.server.coffee"
    path = expandPath argv._[1], "./server/src/models/"
    if not fd.extname(path) then path += ".coffee"
    (new Template(template, path, values)).write()
    console.log '-> Generated: '+path
    template = __dirname + "/../assets/model.assets.coffee"
    path = expandPath argv._[1], "./server/src/assets/"
    if not fd.extname(path) then path += ".coffee"
    (new Template(template, path, values)).write()
    console.log '-> Generated: '+path
  # Private
  
  stylusPackage: ->
    stylus.createPackage(@options.index_style)
  
  coffeePackage: ->
    coffee.createPackage(
      dependencies: @options.dependencies
      paths: @options.paths
      scripts: @options.js
      main: @options.index_script
    )
  jadePackage: ->
    jade.createPackage(@options.index_view)
  

module.exports = Cmd