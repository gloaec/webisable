(function() {
  var Jade, dirname, existsSync, fs, jade, log, _ref;

  _ref = require('path'), existsSync = _ref.existsSync, dirname = _ref.dirname;

  jade = require('jade');

  fs = require('fs');

  log = require('./wia.utils').log;

  Jade = (function() {

    function Jade(path, obj) {
      this.path = path != null ? path : '';
      this.obj = obj != null ? obj : {};
      if (existsSync(this.path + ".jade")) {
        this.path += ".jade";
      } else if (existsSync(this.path + ".html")) {
        this.path += ".html";
      } else {
        log({
          h: 'Jade',
          message: 'Compile Html',
          target: this.path,
          error: "[" + this.path + ".jade | " + this.path + ".html] : Not found"
        });
        throw '';
      }
    }

    Jade.prototype.compile = function(compress) {
      var content, err, result;
      if (compress == null) compress = false;
      content = fs.readFileSync(this.path, 'utf-8');
      result = jade.compile(content, {
        filename: this.path,
        pretty: !compress,
        compileDebug: !compress
      });
      err = false;
      log({
        h: 'Jade',
        message: 'Compile Html',
        target: this.path,
        success: !err,
        error: err
      });
      return result(this.obj);
    };

    Jade.prototype.createServer = function() {
      var _this = this;
      return function(req, res, next) {
        var content;
        log({
          m: 'HTTP',
          h: 'GET',
          target: '/index.html'
        });
        content = _this.compile();
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.end(content);
        return log({
          h: ['->', 'Dynamic'],
          message: 'Build',
          target: '/index.html',
          success: true,
          nl: true
        });
      };
    };

    return Jade;

  })();

  module.exports = {
    Jade: Jade,
    createPackage: function(path) {
      return new Jade(path);
    }
  };

}).call(this);
