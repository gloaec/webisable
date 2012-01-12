(function() {
  var Template, fd, fs, isDir;

  fs = require("fs");

  fd = require("path");

  isDir = require("./wia.utils").isDir;

  Template = (function() {

    function Template(template, path, values) {
      this.template = fd.resolve(template);
      this.path = fd.resolve(path);
      this.values = values || {};
    }

    Template.prototype.getFiles = function() {
      var files, next, self;
      if (!isDir(this.template)) return [this.template];
      self = this;
      files = [];
      next = function(dir) {
        return fs.readdirSync(dir).forEach(function(file) {
          files.push(file = dir + '/' + file);
          if (isDir(file)) return next(file);
        });
      };
      next(this.template);
      return files;
    };

    Template.prototype.write = function() {
      this.files = this.getFiles();
      return this.files.forEach(function(path) {
        var data, out;
        out = path.replace(this.template, "");
        out = fd.join(this.path, out);
        out = fd.normalize(out);
        if (isDir(path)) {
          return fs.mkdirSync(out, 0775);
        } else if (fd.existsSync(out)) {
          throw path + " already exists";
        } else {
          data = this.parse(fs.readFileSync(path, "utf8"));
          return fs.writeFileSync(out, data);
        }
      }, this);
    };

    Template.prototype.parse = function(data) {
      var self;
      self = this;
      return data.replace(/\{\{([^}]+)\}\}/g, function(_, key) {
        return self.values[key];
      });
    };

    return Template;

  })();

  module.exports = Template;

}).call(this);
