{mysql} = require 'wia.server'
db      = require '../mysql'

{{Name}} = db.define '{{Name}}',

  attr1: mysql.STRING  #===> VARCHAR(255)
  attr2: mysql.TEXT    #===> TEXT
  attr3: mysql.INTEGER #===> INT
  attr4: mysql.DATE    #===> DATETIME
  attr5: mysql.BOOLEAN #===> TINYINT(1)
,#---------------------------------------
  timestamps: true
  freezeTableName: true
  classMethods: 
    staticExample: -> 
      @name
  instanceMethods:
    toJSON: toJSON
  
{{Name}}.hasOne {{Name}}, as: 'Parent', foreignKey: 'parentId'
#-> {{name}}#setParent
#-> {{name}}#getParent

{{Name}}.hasMany {{Name}}, as: 'Childrens'
#-> {{name}}#setChildrens
#-> {{name}}#getChildrens

### 
  Also supported: 
    {{name}}.haOne   require('myOtherModel'), options
    {{name}}.hasMany require('myOtherModel'), options
###

module.exports = {{Name}} 