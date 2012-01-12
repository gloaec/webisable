(function() {
  var Cmd, Template, camelize, coffee, exec, expandPath, express, fd, fs, jade, log, print, spawn, stylus, watchTree, _ref, _ref2;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fd = require('path');

  express = require('express');

  fs = require('fs');

  print = require('sys').print;

  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;

  watchTree = require('watch-tree').watchTree;

  coffee = require('./wia.coffee');

  stylus = require('./wia.stylus');

  jade = require('./wia.jade');

  Template = require('./wia.template');

  _ref2 = require('./wia.utils'), expandPath = _ref2.expandPath, camelize = _ref2.camelize, log = _ref2.log;

  Cmd = (function() {

    Cmd.prototype.defaults = {
      slug: './app/app.json',
      index_script: './app/app',
      index_style: './app/app',
      index_view: './app/app',
      index_server: './server/lib/server.js',
      js: [],
      css: [],
      public: './public',
      paths: ['./app'],
      dependencies: ['wia'],
      port: process.env.PORT || 9294
    };

    Cmd.readSlug = function(path) {
      return JSON.parse(fs.readFileSync(path, 'utf-8'));
    };

    function Cmd(options) {
      var key, value, _base, _ref3;
      this.options = options != null ? options : {};
      this.initServer = __bind(this.initServer, this);
      if (typeof this.options === 'string') {
        this.options = this.readSlug(this.options);
      }
      _ref3 = this.defaults;
      for (key in _ref3) {
        value = _ref3[key];
        (_base = this.options)[key] || (_base[key] = value);
      }
      this.options.public = fd.resolve(this.options.public);
    }

    Cmd.prototype.build = function(argv) {
      var target;
      if (typeof argv === 'string') {
        target = argv;
      } else {
        if (target == null) target = argv._[1];
      }
      if (target && target !== ('all' || 'a')) {
        if (target === ('client' || 'c')) {
          return this.buildClient();
        } else if (target === ('server' || 's')) {
          return this.buildServer();
        } else {
          return log({
            target: target,
            error: "No such building option"
          });
        }
      } else {
        this.buildClient();
        return this.buildServer();
      }
    };

    Cmd.prototype.buildServer = function(watch, callback) {
      var sub;
      if (typeof watch === 'function') {
        callback = watch;
        watch = false;
      }
      return sub = exec('coffee -c -o server/lib server/src', function(error, out, err) {
        log({
          message: 'Compile Server',
          error: err,
          info: out,
          success: !error
        });
        if (!error) return typeof callback === "function" ? callback() : void 0;
      });
    };

    Cmd.prototype.buildClient = function() {
      var applicationPath, package;
      applicationPath = this.options.public + '/js/app.js';
      log({
        m: 'API',
        h: 'Coffee',
        message: 'Build',
        target: applicationPath
      });
      package = this.coffeePackage().compile(true);
      fs.writeFileSync(applicationPath, package);
      log({
        h: ['->', 'Static'],
        message: 'Build',
        target: applicationPath,
        success: true,
        nl: true
      });
      applicationPath = this.options.public + '/css/app.css';
      log({
        m: 'API',
        h: 'Stylus',
        message: 'Build',
        target: applicationPath
      });
      package = this.stylusPackage().compile(true);
      fs.writeFileSync(applicationPath, package);
      log({
        h: ['->', 'Static'],
        message: 'Build',
        target: applicationPath,
        success: true,
        nl: true
      });
      applicationPath = this.options.public + '/index.html';
      log({
        m: 'API',
        h: 'Jade',
        message: 'Build',
        target: applicationPath
      });
      package = this.jadePackage().compile(true);
      fs.writeFileSync(applicationPath, package);
      return log({
        h: ['->', 'Static'],
        message: 'Build',
        target: applicationPath,
        success: true,
        nl: true
      });
    };

    Cmd.prototype.initServer = function() {
      var S;
      S = this;
      return this.buildServer(function() {
        return S.startServer();
      });
    };

    Cmd.prototype.startServer = function() {
      var install;
      install = spawn('node', [this.options.index_server]);
      install.stderr.on('data', function(data) {
        return process.stderr.write(data.toString());
      });
      install.stdout.on('data', function(data) {
        return print(data.toString());
      });
      return install.on('exit', function(code) {
        if (code === 0) {
          return typeof callback === "function" ? callback() : void 0;
        }
      });
    };

    Cmd.prototype.static = function() {
      log({
        m: 'SERVER',
        h: 'Static',
        message: 'Starting server'
      });
      return this.startServer();
    };

    Cmd.prototype.server = function() {
      var watcher;
      log({
        m: 'SERVER',
        h: 'Development',
        message: 'Starting server'
      });
      this.initServer();
      log({
        message: 'Watch Server',
        info: 'watching…'
      });
      watcher = watchTree('server/src', {
        'sample-rate': 5
      });
      watcher.on('fileModified', this.initServer);
      return watcher.on('fileCreated', this.initServer);
    };

    Cmd.prototype.createServer = function() {
      var exists, _ref3;
      if ((_ref3 = this.node) != null) _ref3.close();
      exists = true;
      console.log(require.paths);
      this.node = exists ? require(this.options.index_server).createServer() : require('express').createServer();
      log({
        message: 'Load Server',
        target: this.options.index_server,
        success: exists,
        error: exists ? false : 'File not found'
      });
      this.node.get('/js/app.js', this.coffeePackage().createServer());
      this.node.get('/css/app.css', this.stylusPackage().createServer());
      this.node.get('/index.html', this.jadePackage().createServer());
      this.node.get('/', this.jadePackage().createServer());
      return this.node.use(express.static(this.options.public));
    };

    Cmd.prototype.listen = function() {
      this.node.listen(this.options.port);
      log({
        message: 'Port',
        target: this.options.port
      });
      return log({
        message: 'Ctrl+C to shutdown server',
        info: 'listening…',
        nl: true
      });
    };

    /*
      
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
    */

    Cmd.prototype.install = function(callback) {
      var install;
      install = spawn('npm', ['install']);
      install.stderr.on('data', function(data) {
        return process.stderr.write(data.toString());
      });
      install.stdout.on('data', function(data) {
        return print(data.toString());
      });
      return install.on('exit', function(code) {
        if (code === 0) {
          return typeof callback === "function" ? callback() : void 0;
        }
      });
    };

    /*
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
    */

    Cmd.prototype.publish = function() {
      this.build();
      return this.static();
    };

    Cmd.prototype.app = function(argv) {
      var path, template;
      template = __dirname + "/../assets/app";
      path = fd.normalize(argv._[1]);
      if (fd.existsSync(path)) throw path + " already exists";
      fs.mkdirSync(path, 0775);
      return (new Template(template, path)).write();
    };

    Cmd.prototype.mobile = function(argv) {
      var path, template;
      template = __dirname + "/../assets/mobile";
      path = fd.normalize(argv._[1]);
      if (fd.existsSync(path)) throw path + " already exists";
      fs.mkdirSync(path, 0775);
      return (new Template(template, path)).write();
    };

    Cmd.prototype.controller = function(argv) {
      var path, template, values;
      values = camelize(fd.basename(argv._[1]));
      template = __dirname + "/../assets/controller.client.coffee";
      path = expandPath(argv._[1], "./app/controllers/");
      if (!fd.extname(path)) path += ".coffee";
      (new Template(template, path, values)).write();
      console.log('-> Generated: ' + path);
      template = __dirname + "/../assets/controller.server.coffee";
      path = expandPath(argv._[1], "./server/src/controllers/");
      if (!fd.extname(path)) path += ".coffee";
      (new Template(template, path, values)).write();
      return console.log('-> Generated: ' + path);
    };

    Cmd.prototype.model = function(argv) {
      var path, template, values;
      values = camelize(fd.basename(argv._[1]));
      template = __dirname + "/../assets/model.client.coffee";
      path = expandPath(argv._[1], "./app/models/");
      if (!fd.extname(path)) path += ".coffee";
      (new Template(template, path, values)).write();
      console.log('-> Generated: ' + path);
      template = __dirname + "/../assets/model.server.coffee";
      path = expandPath(argv._[1], "./server/src/models/");
      if (!fd.extname(path)) path += ".coffee";
      (new Template(template, path, values)).write();
      console.log('-> Generated: ' + path);
      template = __dirname + "/../assets/model.assets.coffee";
      path = expandPath(argv._[1], "./server/src/assets/");
      if (!fd.extname(path)) path += ".coffee";
      (new Template(template, path, values)).write();
      return console.log('-> Generated: ' + path);
    };

    Cmd.prototype.stylusPackage = function() {
      return stylus.createPackage(this.options.index_style);
    };

    Cmd.prototype.coffeePackage = function() {
      return coffee.createPackage({
        dependencies: this.options.dependencies,
        paths: this.options.paths,
        scripts: this.options.js,
        main: this.options.index_script
      });
    };

    Cmd.prototype.jadePackage = function() {
      return jade.createPackage(this.options.index_view);
    };

    return Cmd;

  })();

  module.exports = Cmd;

}).call(this);
