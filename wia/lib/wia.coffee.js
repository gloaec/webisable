(function() {
  var Dependency, Package, Stitch, compilers, eco, fs, log, stitch, toArray, uglify, _ref;

  fs = require('fs');

  eco = require('eco');

  uglify = require('uglify-js');

  compilers = require('./wia.compilers');

  stitch = require('../assets/stitch');

  Dependency = require('./wia.dependency');

  Stitch = require('./wia.stitch');

  _ref = require('./wia.utils'), log = _ref.log, toArray = _ref.toArray;

  Package = (function() {

    function Package(config) {
      var _ref2;
      if (config == null) config = {};
      this.identifier = (_ref2 = config.identifier) != null ? _ref2 : 'require';
      this.scripts = toArray(config.scripts);
      this.paths = toArray(config.paths);
      this.dependencies = toArray(config.dependencies);
    }

    Package.prototype.compileModules = function() {
      this.dependency || (this.dependency = new Dependency(this.dependencies));
      this.stitch = new Stitch(this.paths);
      this.modules = this.dependency.resolve().concat(this.stitch.resolve());
      return stitch({
        identifier: this.identifier,
        modules: this.modules
      });
    };

    Package.prototype.compileLibs = function() {
      var content, err, path, _i, _len, _ref2;
      content = [];
      _ref2 = this.scripts;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        path = _ref2[_i];
        content.push(fs.readFileSync(path, 'utf8'));
        err = false;
        log({
          h: 'Coffee',
          message: 'Compile JS Lib',
          target: path,
          success: !err,
          error: err
        });
      }
      return content.join("\n");
    };

    Package.prototype.compile = function(compress) {
      var content, err;
      if (compress == null) compress = false;
      content = [this.compileLibs(), this.compileModules()].join("\n");
      err = false;
      log({
        h: 'Coffee',
        message: 'Compile JS Application',
        target: '/js/app.js',
        success: !err,
        error: err
      });
      if (compress) {
        content = uglify(content);
        err = false;
        log({
          h: 'Coffee',
          message: 'Compress JS',
          target: '/js/app.js',
          success: !err,
          error: err
        });
      }
      return content;
    };

    Package.prototype.createServer = function() {
      var _this = this;
      return function(req, res, next) {
        var content;
        log({
          m: 'HTTP',
          h: 'GET',
          target: '/js/app.js'
        });
        content = _this.compile();
        res.writeHead(200, {
          'Content-Type': 'text/javascript'
        });
        res.end(content);
        return log({
          h: ['->', 'Dynamic'],
          message: 'Build',
          target: '/js/app.js',
          success: true,
          nl: true
        });
      };
    };

    return Package;

  })();

  module.exports = {
    compilers: compilers,
    Package: Package,
    createPackage: function(config) {
      return new Package(config);
    }
  };

}).call(this);
