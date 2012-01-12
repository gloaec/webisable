wia = require 'wia'

class Users extends wia.Controller

  tag: 'div'
  el: $('<div>')

  elements:
    '.items': 'items'

  events: 
    'click .item': 'click'

  click: (event) ->
    alert 'clicked'