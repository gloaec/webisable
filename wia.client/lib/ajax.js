(function() {
  var $, Ajax, Base, Collection, Extend, Include, Model, Singleton;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  if (typeof Spine === "undefined" || Spine === null) Spine = require('spine');

  $ = Spine.$;

  Model = Spine.Model;

  Ajax = {
    getURL: function(object) {
      return object && (typeof object.url === "function" ? object.url() : void 0) || object.url;
    },
    enabled: true,
    pending: false,
    requests: [],
    disable: function(callback) {
      this.enabled = false;
      callback();
      return this.enabled = true;
    },
    requestNext: function() {
      var next;
      next = this.requests.shift();
      if (next) {
        return this.request(next);
      } else {
        return this.pending = false;
      }
    },
    request: function(callback) {
      var _this = this;
      return (callback()).complete(function() {
        return _this.requestNext();
      });
    },
    queue: function(callback) {
      if (!this.enabled) return;
      if (this.pending) {
        this.requests.push(callback);
      } else {
        this.pending = true;
        this.request(callback);
      }
      return callback;
    }
  };

  Base = (function() {

    function Base() {}

    Base.prototype.defaults = {
      contentType: 'application/json',
      dataType: 'json',
      processData: false
    };

    Base.prototype.ajax = function(params, defaults) {
      return $.ajax($.extend({}, this.defaults, defaults, params));
    };

    Base.prototype.queue = function(callback) {
      return Ajax.queue(callback);
    };

    return Base;

  })();

  Collection = (function() {

    __extends(Collection, Base);

    function Collection(model) {
      this.model = model;
      this.errorResponse = __bind(this.errorResponse, this);
      this.recordsResponse = __bind(this.recordsResponse, this);
    }

    Collection.prototype.find = function(id, params) {
      var record;
      record = new this.model({
        id: id
      });
      return this.ajax(params, {
        type: 'GET',
        url: Ajax.getURL(record)
      }).success(this.recordsResponse).error(this.errorResponse);
    };

    Collection.prototype.all = function(params) {
      return this.ajax(params, {
        type: 'GET',
        url: Ajax.getURL(this.model)
      }).success(this.recordsResponse).error(this.errorResponse);
    };

    Collection.prototype.fetch = function(params) {
      var id;
      var _this = this;
      if (params == null) params = {};
      if (id = params.id) {
        delete params.id;
        return this.find(id, params).success(function(record) {
          return _this.model.refresh(record);
        });
      } else {
        return this.all(params).success(function(records) {
          return _this.model.refresh(records);
        });
      }
    };

    Collection.prototype.recordsResponse = function(data, status, xhr) {
      return this.model.trigger('ajaxSuccess', null, status, xhr);
    };

    Collection.prototype.errorResponse = function(xhr, statusText, error) {
      return this.model.trigger('ajaxError', null, xhr, statusText, error);
    };

    return Collection;

  })();

  Singleton = (function() {

    __extends(Singleton, Base);

    function Singleton(record) {
      this.record = record;
      this.errorResponse = __bind(this.errorResponse, this);
      this.blankResponse = __bind(this.blankResponse, this);
      this.recordResponse = __bind(this.recordResponse, this);
      this.model = this.record.constructor;
    }

    Singleton.prototype.reload = function(params) {
      var _this = this;
      return this.queue(function() {
        return _this.ajax(params, {
          type: 'GET',
          url: Ajax.getURL(_this.record)
        }).success(_this.recordResponse).error(_this.errorResponse);
      });
    };

    Singleton.prototype.create = function(params) {
      var _this = this;
      return this.queue(function() {
        return _this.ajax(params, {
          type: 'POST',
          data: JSON.stringify(_this.record),
          url: Ajax.getURL(_this.model)
        }).success(_this.recordResponse).error(_this.errorResponse);
      });
    };

    Singleton.prototype.update = function(params) {
      var _this = this;
      return this.queue(function() {
        return _this.ajax(params, {
          type: 'PUT',
          data: JSON.stringify(_this.record),
          url: Ajax.getURL(_this.record)
        }).success(_this.recordResponse).error(_this.errorResponse);
      });
    };

    Singleton.prototype.destroy = function(params) {
      var _this = this;
      return this.queue(function() {
        return _this.ajax(params, {
          type: 'DELETE',
          url: Ajax.getURL(_this.record)
        }).success(_this.recordResponse).error(_this.errorResponse);
      });
    };

    Singleton.prototype.recordResponse = function(data, status, xhr) {
      var _this = this;
      this.record.trigger('ajaxSuccess', status, xhr);
      if (Spine.isBlank(data)) return;
      data = this.model.fromJSON(data);
      return Ajax.disable(function() {
        if (data.id && _this.record.id !== data.id) _this.record.changeID(data.id);
        return _this.record.updateAttributes(data.attributes());
      });
    };

    Singleton.prototype.blankResponse = function(data, status, xhr) {
      return this.record.trigger('ajaxSuccess', status, xhr);
    };

    Singleton.prototype.errorResponse = function(xhr, statusText, error) {
      return this.record.trigger('ajaxError', xhr, statusText, error);
    };

    return Singleton;

  })();

  Model.host = '';

  Include = {
    ajax: function() {
      return new Singleton(this);
    },
    url: function() {
      var base;
      base = Ajax.getURL(this.constructor);
      if (base.charAt(base.length - 1) !== '/') base += '/';
      base += encodeURIComponent(this.id);
      return base;
    }
  };

  Extend = {
    ajax: function() {
      return new Collection(this);
    },
    url: function() {
      return "" + Model.host + "/" + (this.className.toLowerCase()) + "s";
    }
  };

  Model.Ajax = {
    extended: function() {
      this.fetch(this.ajaxFetch);
      this.change(this.ajaxChange);
      this.extend(Extend);
      return this.include(Include);
    },
    ajaxFetch: function() {
      var _ref;
      return (_ref = this.ajax()).fetch.apply(_ref, arguments);
    },
    ajaxChange: function(record, type) {
      return record.ajax()[type]();
    }
  };

  Model.Ajax.Methods = {
    extended: function() {
      this.extend(Extend);
      return this.include(Include);
    }
  };

  Spine.Ajax = Ajax;

  if (typeof module !== "undefined" && module !== null) module.exports = Ajax;

}).call(this);
