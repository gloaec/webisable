wia = require 'wia'

class User extends wia.Model

  @configure 'User', 'first_name', 'last_name', 'adress', 'created', 'updated'

  @filter: (query) -> 
    @select (c) -> 
      c.first_name.indexOf(query) is not -1

  fullName: -> [@first_name, @last_name].join(' ')
  
module.exports.User = User
