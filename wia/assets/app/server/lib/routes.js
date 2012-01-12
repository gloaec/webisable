(function() {
  var app, express, resource;

  express = require('express');

  resource = require('express-resource');

  app = express.createServer();

  app.resource('user', require('./controllers/user'));

  app.listen(3000);

}).call(this);
