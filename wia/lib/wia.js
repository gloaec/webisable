(function() {
  var database, wia;

  database = require('wia.server').database;

  wia = {
    mysql: Sequelize,
    db: new Sequelize('database', 'username', 'password', {
      host: "localhost"
    }),
    app: require('spine')
  };

  module.exports = wia;

}).call(this);
