(function() {
  var Cmd, Server, express, resource;

  express = require('express');

  resource = require('express-resource');

  Cmd = require('wia.cmd');

  Server = (function() {

    function Server(config) {
      var options;
      if (config == null) config = {};
      options = fd.existsSync('./app/app.json' != null ? './app/app.json' : Cmd.readSlug({
        './app/app.json': config
      }));
      this.cmd = new Cmd(options);
      this.cmd.createServer();
    }

    Server.prototype.mysql = require('sequelize');

    Server.prototype.listen = function() {
      var _ref;
      return (_ref = this.cmd) != null ? _ref.listen() : void 0;
    };

    return Server;

  })();

  module.exports = Server;

}).call(this);
