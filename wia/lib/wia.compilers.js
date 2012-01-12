(function() {
  var compilers, cs, eco, fs;

  fs = require('fs');

  compilers = {};

  compilers.js = function(path) {
    return fs.readFileSync(path, 'utf8');
  };

  cs = require('coffee-script');

  compilers.coffee = function(path) {
    return cs.compile(fs.readFileSync(path, 'utf8'), {
      filename: path
    });
  };

  /*
  stylus = require 'stylus'
  compilers.stylus = (path) ->
    console.log 'STYLUS | ' + path
    stylus.render(fs.readFileSync(path, 'utf8'), filename: path)
    
  jade = require 'jade'
  compilers.jade = (path) ->
    console.log 'JADE   | ' + path
    jade.compile(fs.readFileSync(path, 'utf8'), { filename: path, compileDebug: false }) #pretty: true
  */

  eco = require('eco');

  compilers.eco = function(path) {
    var content;
    content = eco.precompile(fs.readFileSync(path, 'utf8'));
    return "module.exports = " + content;
  };

  compilers.jeco = function(path) {
    var content;
    content = eco.precompile(fs.readFileSync(path, 'utf8'));
    return "module.exports = function(values){ \n  var $  = jQuery, result = $();\n  values = $.makeArray(values);\n  \n  for(var i=0; i < values.length; i++) {\n    var value = values[i];\n    var elem  = $((" + content + ")(value));\n    elem.data('item', value);\n    $.merge(result, elem);\n  }\n  return result;\n};";
  };

  require.extensions['.jeco'] = require.extensions['.eco'];

  compilers.tmpl = function(path) {
    var content;
    content = fs.readFileSync(path, 'utf8');
    return ("var template = jQuery.template(" + (JSON.stringify(content)) + ");\n") + "module.exports = (function(data){ return jQuery.tmpl(template, data); });\n";
  };

  require.extensions['.tmpl'] = function(module, filename) {
    return module._compile(compilers.tmpl(filename));
  };

  module.exports = compilers;

}).call(this);
