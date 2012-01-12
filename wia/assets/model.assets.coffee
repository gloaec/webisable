{{Name}} = require '../models/{{name}}'

{{name}}1 = {{Name}}.create
  # attribute1: 'value1'
  # attribute2: 'value2'
  # attribute3: 'value3'
  
###
document1 = Document.create
document2 = Document.create

user1.setDocuments [document1, document2].on 'success', ->
  console.log 'succès'
###