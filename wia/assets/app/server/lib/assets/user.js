(function() {
  var User, user1;

  User = require('../models/user');

  user1 = User.create({
    first_name: 'Bobby',
    last_name: 'Lapointe'
  });

  /*
  document1 = Document.create
  document2 = Document.create
  
  user1.setDocuments [document1, document2].on 'success', ->
    console.log 'succès'
  */

}).call(this);
