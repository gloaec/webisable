fs      = require("fs")
fd      = require("path")
{isDir} = require("./wia.utils")

class Template

  constructor: (template, path, values) ->
    @template = fd.resolve template
    @path     = fd.resolve path
    @values   = values or {}

  getFiles: ->
    if not isDir @template then return [@template]
    self = @
    files = []

    next = (dir) ->
      fs.readdirSync(dir).forEach (file) ->
        files.push(file = dir + '/' + file)
        if isDir(file) then next(file)

    next(@template)
    files

  write: ->
    @files = @getFiles()
    @files.forEach (path) ->
      out = path.replace @template, ""
      out = fd.join @path, out
      out = fd.normalize out
    
      if isDir(path) then fs.mkdirSync(out, 0775)
      else if fd.existsSync(out) then throw(path + " already exists")
      else 
        data = @parse fs.readFileSync(path, "utf8")
        fs.writeFileSync out, data 
    , this

  parse: (data) ->
    self = @;
    data.replace /\{\{([^}]+)\}\}/g, (_, key) ->
      self.values[key]

module.exports = Template