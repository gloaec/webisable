(function() {
  var User, db, mysql;

  mysql = require("sequelize");

  db = new mysql('kobpae_test', 'root', 'turtoise', {
    host: "localhost"
  });

  User = db.define('User', {
    first_name: mysql.STRING,
    last_name: mysql.STRING,
    adress: mysql.TEXT,
    created: mysql.DATE,
    updated: mysql.DATE
  });

  User.hasOne(User, {
    as: 'GodFather',
    foreignKey: 'godFatherId'
  });

  User.sync().on('success', function() {
    return console.log('coooooolll');
  }).on('failure', function() {});

  module.exports.User = User;

}).call(this);
