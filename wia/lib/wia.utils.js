(function() {
  var ansi, camelize, fd, flatten, fs, now, printNum;

  fs = require("fs");

  fd = require("path");

  ansi = require('string-color');

  String.prototype.capitalize = function() {
    return [this.charAt(0).toUpperCase(), this.slice(1)].join('');
  };

  module.exports.isDir = function(path) {
    return fs.statSync(path).isDirectory();
  };

  module.exports.expandPath = function(path, dir) {
    if (fd.basename(path === path)) path = dir + path;
    return fd.normalize(path);
  };

  module.exports.camelize = camelize = function(str) {
    str = str.replace(/-|_+(.)?/g, function(match, chr) {
      return (chr != null ? chr.toUpperCase() : void 0) || '';
    }).replace(/^(.)?/, function(match, chr) {
      return (chr != null ? chr.toUpperCase() : void 0) || '';
    });
    return {
      Name: str.capitalize(),
      name: str.toLowerCase(),
      NAME: str.toUpperCase()
    };
  };

  module.exports.flatten = flatten = function(array, results) {
    var item, _i, _len;
    if (results == null) results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (Array.isArray(item)) {
        flatten(item, results);
      } else {
        results.push(item);
      }
    }
    return results;
  };

  module.exports.toJSON = function() {
    var ctx, obj;
    obj = new Object();
    ctx = this;
    this.attributes.forEach(function(attr) {
      return obj[attr] = ctx[attr];
    });
    return obj;
  };

  module.exports.toArray = function(value) {
    if (value == null) value = [];
    if (Array.isArray(value)) {
      return value;
    } else {
      return [value];
    }
  };

  module.exports.printNum = printNum = function(number, nbchar) {
    var num;
    num = nbchar - number.toString().length;
    while (num--) {
      number = '0' + number;
    }
    return number;
  };

  module.exports.now = now = {
    date: function() {
      var d;
      d = new Date();
      return [printNum(d.getDate(), 2), '-', printNum(d.getMonth() + 1, 2), '-', d.getFullYear()].join('');
    },
    time: function() {
      var d;
      d = new Date();
      return [printNum(d.getHours(), 2), ':', printNum(d.getMinutes() + 1, 2), ':', printNum(d.getSeconds(), 2)].join('');
    }
  };

  module.exports.log = require('./wia.log');

  /*
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
  */

}).call(this);
