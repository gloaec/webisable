{now} = require('./wia.utils')

log = (options = {}) ->

  defaults =
    line: ''
    timestamp: true
    nl: false
    error: ''
    success: ''
    info: ''
    message: ''
    target: ''
    h: []
    m: false
    hStyles: [
      ['white','bgblack']
      ['bold']
    ]
    mStyles: 
      HTTP: ['white','bgpurple','bold']
      API: ['white','bgblue','bold']
      SERVER: ['white','bgyellow','bold']
    mh:
      HTTP: ['purple','bold']
      API: ['blue','bold']
      SERVER: ['yellow','bold']
    tStyle: ['cyan','italic']
    
  apply = (messages, styles) ->
    if typeof messages is 'string' then return String().color.apply(' '+messages+' ',styles[0])
    (String().color.apply(' '+value+' ',styles[key]) for key, value of messages).join('')
    
  error = (message) ->
    ['error'.color('red','bold'),message.color('red') if typeof message is 'string'].join(' ')
  success = (message) ->
    ['success'.color('green','bold'),message.color('green') if typeof message is 'string'].join(' ')
  info = (message) ->
    message.color('blue','bold') if typeof message is 'string'
    
  options[key] or= value for key, value of defaults
  options.hStyles.unshift options.mh[options.m] if options.m and options.mh[options.m]
  line = []
  line.push ( [now.date(),now.time().color('bgwhite','black')].join(' ') ) if options.timestamp
  line.push ( String().color.apply(' '+options.m+' ',options.mStyles[options.m]) ) if options.m and options.mStyles[options.m]
  line.push ( apply options.h, options.hStyles ) if options.h.length?
  line.push ( options.message ) if options.message?
  line.push ( String().color.apply(['"',options.target,'"'].join(''),options.tStyle) ) if options.target
  line.push ( error options.error ) if options.error
  line.push ( success options.success ) if options.success
  line.push ( info options.info ) if options.info
  line.push ( '\n' ) if options.nl
  console.log line.join(' ')
  
module.exports = log
 