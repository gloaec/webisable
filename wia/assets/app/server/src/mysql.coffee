{Database} = require 'wia.server'

module.exports = new Database 'database', 'username', 'password',
  host: "localhost"
  #port: 12345
  