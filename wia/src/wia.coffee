{database} = require 'wia.server'

wia = {
  
  mysql: Sequelize
  
  db: new Sequelize 'database', 'username', 'password',
    host: "localhost"
    #port: 12345
    
  app: require('spine')
  
}

module.exports = wia