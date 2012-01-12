express  = require('express')
resource = require('express-resource')
Cmd      = require('wia.cmd')

class Server

  constructor: (config = {}) ->
    options = fd.existsSync './app/app.json' ? Cmd.readSlug './app/app.json' : config
    @cmd     = new Cmd options
    @cmd.createServer()
   
   mysql: require('sequelize')

   listen: ->
     @cmd?.listen()
     
module.exports = Server