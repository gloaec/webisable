{Server} = require 'wia.server'

Server.resource 'example', require('./controllers/example')

module.exports = Server