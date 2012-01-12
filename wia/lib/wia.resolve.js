(function() {
  var Module, basename, dirname, extname, invalidDirs, isAbsolute, join, log, modulePaths, modulerize, repl, resolve, _ref;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  Module = require('module');

  _ref = require('path'), join = _ref.join, extname = _ref.extname, dirname = _ref.dirname, basename = _ref.basename, resolve = _ref.resolve;

  log = require('./wia.utils').log;

  isAbsolute = function(path) {
    return /^\//.test(path);
  };

  modulerize = function(id, filename) {
    var ext;
    if (filename == null) filename = id;
    ext = extname(filename);
    return join(dirname(id), basename(id, ext));
  };

  modulePaths = Module._nodeModulePaths(process.cwd());

  invalidDirs = ['/', '.'];

  repl = {
    id: 'repl',
    filename: join(process.cwd(), 'repl'),
    paths: modulePaths
  };

  module.exports = function(request, parent) {
    var dir, filename, id, paths, _, _ref2;
    if (parent == null) parent = repl;
    _ref2 = Module._resolveLookupPaths(request, parent), _ = _ref2[0], paths = _ref2[1];
    filename = Module._findPath(request, paths);
    dir = filename;
    if (!filename) {
      log({
        h: 'Package',
        message: 'Include Package',
        target: request,
        error: 'Cannot find module'
      });
      log({
        info: 'Have you run `wia install` ?'
      });
      throw '';
    }
    while (__indexOf.call(invalidDirs, dir) < 0 && __indexOf.call(modulePaths, dir) < 0) {
      dir = dirname(dir);
    }
    if (__indexOf.call(invalidDirs, dir) >= 0) {
      log({
        h: 'Package',
        message: 'Include Package',
        target: request,
        error: 'Load path not found `#{filename}`'
      });
      throw '';
    }
    id = filename.replace("" + dir + "/", '');
    log({
      h: 'Package',
      message: 'Include Package',
      target: request,
      success: true
    });
    return [modulerize(id, filename), filename];
  };

  module.exports.paths = function(filename) {
    return Module._nodeModulePaths(dirname(filename));
  };

  module.exports.modulerize = modulerize;

}).call(this);
