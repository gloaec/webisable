(function() {
  var Stylus, dirname, existsSync, fs, log, stylus, _ref;

  _ref = require('path'), existsSync = _ref.existsSync, dirname = _ref.dirname;

  stylus = require('stylus');

  fs = require('fs');

  log = require('./wia.utils').log;

  Stylus = (function() {

    function Stylus(path) {
      this.path = path != null ? path : '';
      if (existsSync(this.path + ".styl")) this.path += ".styl";
      if (existsSync(this.path + ".css")) this.path += ".css";
    }

    Stylus.prototype.compile = function(compress) {
      var content, result;
      if (compress == null) compress = false;
      content = fs.readFileSync(this.path, 'utf-8');
      result = '';
      stylus(content).include(dirname(this.path)).set('compress', compress).render(function(err, css) {
        log({
          h: 'Stylus',
          message: 'Compile CSS',
          target: this.path,
          success: !err,
          error: err
        });
        if (err) throw err;
        return result = css;
      });
      return result;
    };

    Stylus.prototype.createServer = function() {
      var _this = this;
      return function(req, res, next) {
        var content;
        log({
          m: 'HTTP',
          h: 'GET',
          target: '/css/app.css'
        });
        content = _this.compile();
        res.writeHead(200, {
          'Content-Type': 'text/css'
        });
        res.end(content);
        return log({
          h: ['->', 'Dynamic'],
          message: 'Build',
          target: '/css/app.css',
          success: true,
          nl: true
        });
      };
    };

    return Stylus;

  })();

  module.exports = {
    Stylus: Stylus,
    createPackage: function(path) {
      return new Stylus(path);
    }
  };

}).call(this);
