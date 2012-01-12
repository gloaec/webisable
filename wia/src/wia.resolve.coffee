Module = require('module')
{join, extname, dirname, basename, resolve} = require('path')
{log} = require('./wia.utils')

isAbsolute = (path) -> /^\//.test(path)

# Normalize paths and remove extensions
# to create valid CommonJS module names
modulerize = (id, filename = id) -> 
  ext = extname(filename)
  join(dirname(id), basename(id, ext))

modulePaths = Module._nodeModulePaths(process.cwd())

invalidDirs = ['/', '.']

repl =
  id: 'repl'
  filename: join(process.cwd(), 'repl')
  paths: modulePaths

# Resolves a `require()` call. Pass in the name of the module where
# the call was made, and the path that was required. 
# Returns an array of: [moduleName, scriptPath]
module.exports = (request, parent = repl) ->

  [_, paths]  = Module._resolveLookupPaths(request, parent)  
  filename    = Module._findPath(request, paths)
  dir         = filename
   
  
  if not filename
    log {h: 'Package', message: 'Include Package', target: request, error: 'Cannot find module'}
    log {info: 'Have you run `wia install` ?'}
    throw ''
    
  # Find package root relative to localModules folder
  while dir not in invalidDirs and dir not in modulePaths
    dir = dirname(dir)
  
  if dir in invalidDirs
    log {h: 'Package', message: 'Include Package', target: request, error: 'Load path not found `#{filename}`' }
    throw ''
    
  id = filename.replace("#{dir}/", '')
  
  log {h: 'Package', message: 'Include Package', target: request, success: true }
  [modulerize(id, filename), filename]
  
module.exports.paths = (filename) ->
  Module._nodeModulePaths(dirname(filename))
  
module.exports.modulerize = modulerize