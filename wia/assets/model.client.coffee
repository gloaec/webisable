{Model} = require 'wia'

class {{Name}} extends Model

  @configure '{{Name}}' #, 'attribute 1', 'attribute 2' …
  
  ###
  @filter: (query) -> 
    @select (c) -> 
      c.first_name.indexOf(query) is not -1

  fullName: -> [@first_name, @last_name].join(' ')
  ###
  
module.exports = {{Name}}
