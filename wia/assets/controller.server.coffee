{{Name}} = require '../models/{{name}}'

exports.index = (req, res) ->
  {{Name}}.findAll().on 'success', ({{name}}s) ->   
    res.json {{name}}s.map ->
      ({{name}}) ->
        {{name}}.mapAttributes()

exports.new = (req, res) ->
  {{name}} = {{Name}}.create(req)
  res.json {{name}}.mapAttributes()

exports.create = (req, res) ->
 {{name}} = {{Name}}.create(req)
 res.json {{name}}.mapAttributes()

exports.show = (req, res) ->
  res.json req.{{name}}.mapAttributes()

exports.edit = (req, res) ->
  res.json req.{{name}}.mapAttributes()
  
exports.update = (req, res) ->
  res.json req.{{name}}.mapAttributes()

exports.destroy = (req, res) ->
  req.{{namename}}.delete()
  res.json {}

exports.load = (id, fn) ->
  process.nextTick ->
    fn null, {{Name}}.find(id)