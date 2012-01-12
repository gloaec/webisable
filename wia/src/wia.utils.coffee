fs   = require("fs")
fd   = require("path")
ansi = require('string-color')

String::capitalize = ->
  [@charAt(0).toUpperCase(), @slice(1)].join('')

module.exports.isDir = (path) ->
  fs.statSync(path).isDirectory()

module.exports.expandPath = (path, dir) ->
  if fd.basename path is path then path = dir + path
  fd.normalize path

module.exports.camelize = camelize = (str) ->
  str = str.replace /-|_+(.)?/g, (match, chr) ->
    chr?.toUpperCase() or ''
  .replace /^(.)?/, (match, chr) ->
    chr?.toUpperCase() or ''
  return {
    Name: str.capitalize()
    name: str.toLowerCase()
    NAME: str.toUpperCase()
  }

module.exports.flatten = flatten =  (array, results = []) ->
  for item in array
    if Array.isArray(item)
      flatten(item, results)
    else
      results.push(item)
  results
  
  
module.exports.toJSON = ->
  obj = new Object()
  ctx = @
  @.attributes.forEach (attr) ->
    obj[attr] = ctx[attr]
  obj;

module.exports.toArray = (value = []) ->
  if Array.isArray(value) then value else [value]

module.exports.printNum = printNum = (number, nbchar) ->
  num = nbchar - number.toString().length
  while num-- 
    number = '0'+number
  number

module.exports.now = now = 
  date: ->
    d = new Date()
    [printNum(d.getDate(),2),'-',printNum(d.getMonth()+1,2),'-',d.getFullYear()].join('')
  time: ->
    d = new Date()
    [printNum(d.getHours(),2),':',printNum(d.getMinutes()+1,2),':',printNum(d.getSeconds(),2)].join('')

module.exports.log = require('./wia.log')

###
module.exports.log =
  
  timestamp: true
  error: null

  head: (options) ->
    line = [
      [now.date(),now.time().color('bgwhite','black'),''].join(' ') if @timestamp
      
    
    logstr = 
    logstr+= (' '+(options.what or "")+' ').color('white','bold', 'bgpurple') 
    logstr+= (' '+(options.method or "")+' ').color('white', 'bgblack')
    logstr+= (' '+(options.info or "")+' ').color('default')
    logstr+= (' '+(if options.target then '"'+options.target+'"' else '')+' ').color('cyan')
    if options.status?
      logstr+= (' '+(options.status or "")+' ').color((if options.status is 'success' then 'green' else if options.status is 'error' then 'red' else 'blue'), 'bold')
    console.log logstr

  body: (options) ->
    logstr = [now.date(),now.time().color('bgwhite','black'),''].join(' ')
    logstr+= ' '.color('white','bold', 'bgpurple') 
    logstr+= (' '+(options.method or "")+' ').color('white', 'bgblack')
    logstr+= (' '+(options.info or "")+' ').color('default')
    logstr+= (' '+(if options.target then '"'+options.target+'"' else '')+' ').color('cyan')
    if options.status?
	      logstr+= (' '+(options.status or "")+' ').color((if options.status is 'success' then 'green' else if options.status is 'error' then 'red' else 'blue'), 'bold')
    console.log logstr

  foot: (options) ->
    logstr = [now.date(),now.time().color('bgwhite','black'),''].join(' ')
    logstr+= ('=>').color('white','bold', 'bgpurple') 
    logstr+= (' '+(options.method or "")+' ').color('white', 'bgblack')
    logstr+= (' '+(options.info or "")+' ').color('default')
    logstr+= (' '+(if options.target then '"'+options.target+'"' else '')+' ').color('cyan')
    if options.status?
      logstr+= (' '+(options.status or "")+' ').color((if options.status is 'success' then 'green' else if options.status is 'error' then 'red' else 'blue'), 'bold')
    console.log logstr, '\n'
 ####
  
