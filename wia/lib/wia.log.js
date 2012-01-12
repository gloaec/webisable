(function() {
  var log, now;

  now = require('./wia.utils').now;

  log = function(options) {
    var apply, defaults, error, info, key, line, success, value;
    if (options == null) options = {};
    defaults = {
      line: '',
      timestamp: true,
      nl: false,
      error: '',
      success: '',
      info: '',
      message: '',
      target: '',
      h: [],
      m: false,
      hStyles: [['white', 'bgblack'], ['bold']],
      mStyles: {
        HTTP: ['white', 'bgpurple', 'bold'],
        API: ['white', 'bgblue', 'bold'],
        SERVER: ['white', 'bgyellow', 'bold']
      },
      mh: {
        HTTP: ['purple', 'bold'],
        API: ['blue', 'bold'],
        SERVER: ['yellow', 'bold']
      },
      tStyle: ['cyan', 'italic']
    };
    apply = function(messages, styles) {
      var key, value;
      if (typeof messages === 'string') {
        return String().color.apply(' ' + messages + ' ', styles[0]);
      }
      return ((function() {
        var _results;
        _results = [];
        for (key in messages) {
          value = messages[key];
          _results.push(String().color.apply(' ' + value + ' ', styles[key]));
        }
        return _results;
      })()).join('');
    };
    error = function(message) {
      return ['error'.color('red', 'bold'), typeof message === 'string' ? message.color('red') : void 0].join(' ');
    };
    success = function(message) {
      return ['success'.color('green', 'bold'), typeof message === 'string' ? message.color('green') : void 0].join(' ');
    };
    info = function(message) {
      if (typeof message === 'string') return message.color('blue', 'bold');
    };
    for (key in defaults) {
      value = defaults[key];
      options[key] || (options[key] = value);
    }
    if (options.m && options.mh[options.m]) {
      options.hStyles.unshift(options.mh[options.m]);
    }
    line = [];
    if (options.timestamp) {
      line.push([now.date(), now.time().color('bgwhite', 'black')].join(' '));
    }
    if (options.m && options.mStyles[options.m]) {
      line.push(String().color.apply(' ' + options.m + ' ', options.mStyles[options.m]));
    }
    if (options.h.length != null) line.push(apply(options.h, options.hStyles));
    if (options.message != null) line.push(options.message);
    if (options.target) {
      line.push(String().color.apply(['"', options.target, '"'].join(''), options.tStyle));
    }
    if (options.error) line.push(error(options.error));
    if (options.success) line.push(success(options.success));
    if (options.info) line.push(info(options.info));
    if (options.nl) line.push('\n');
    return console.log(line.join(' '));
  };

  module.exports = log;

}).call(this);
