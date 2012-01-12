(function() {
  var Module, Stitch, compilers, extname, flatten, fs, join, log, modulerize, resolve, _ref, _ref2;

  _ref = require('path'), extname = _ref.extname, join = _ref.join, resolve = _ref.resolve;

  fs = require('fs');

  compilers = require('./wia.compilers');

  modulerize = require('./wia.resolve').modulerize;

  _ref2 = require('./wia.utils'), flatten = _ref2.flatten, log = _ref2.log;

  Stitch = (function() {

    function Stitch(paths) {
      var path;
      this.paths = paths != null ? paths : [];
      this.paths = (function() {
        var _i, _len, _ref3, _results;
        _ref3 = this.paths;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          path = _ref3[_i];
          _results.push(resolve(path));
        }
        return _results;
      }).call(this);
    }

    Stitch.prototype.resolve = function() {
      var path;
      return flatten((function() {
        var _i, _len, _ref3, _results;
        _ref3 = this.paths;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          path = _ref3[_i];
          _results.push(this.walk(path));
        }
        return _results;
      }).call(this));
    };

    Stitch.prototype.walk = function(path, parent, result) {
      var child, module, stat, _i, _len, _ref3;
      if (parent == null) parent = path;
      if (result == null) result = [];
      _ref3 = fs.readdirSync(path);
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        child = _ref3[_i];
        child = join(path, child);
        stat = fs.statSync(child);
        if (stat.isDirectory()) {
          this.walk(child, parent, result);
        } else {
          module = new Module(child, parent);
          if (module.valid()) result.push(module);
        }
      }
      return result;
    };

    return Stitch;

  })();

  Module = (function() {

    function Module(filename, parent) {
      this.filename = filename;
      this.parent = parent;
      this.ext = extname(this.filename).slice(1);
      this.id = modulerize(this.filename.replace(this.parent + '/', ''));
    }

    Module.prototype.compile = function() {
      var c;
      c = compilers[this.ext](this.filename);
      log({
        h: 'Coffee',
        message: 'Compile JS Module',
        target: this.filename,
        success: true
      });
      return c;
    };

    Module.prototype.valid = function() {
      return !!compilers[this.ext];
    };

    return Module;

  })();

  module.exports = Stitch;

}).call(this);
