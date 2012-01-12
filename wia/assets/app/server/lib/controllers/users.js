(function() {
  var User;

  User = require('../models/user');

  exports.index = function(req, res) {
    return res.send('user index' + console.log(req));
  };

  exports["new"] = function(req, res) {
    return res.send('new user');
  };

  exports.create = function(req, res) {
    User.create(req);
    return res.send('create user');
  };

  exports.show = function(req, res) {
    return res.send('show user ' + req.user.title);
  };

  exports.edit = function(req, res) {
    return res.send('edit user ' + req.user.title);
  };

  exports.update = function(req, res) {
    return res.send('update user ' + req.user.title);
  };

  exports.destroy = function(req, res) {
    return res.send('destroy user ' + req.user.title);
  };

  exports.load = function(id, fn) {
    return process.nextTick(function() {
      return fn(null, User.find(id));
    });
  };

}).call(this);
