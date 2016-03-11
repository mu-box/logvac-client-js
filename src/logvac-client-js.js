var Logvac,
  slice = [].slice;

Logvac = (function() {
  var _backlog, _events, _log_levels;

  _backlog = [];

  _log_levels = ['DEBUG', 'INFO', 'WARN', 'ALERT', 'ERROR', 'SILENT'];

  Logvac.prototype.debug = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'DEBUG',
      styles: 'color:#48B5DA',
      key: key,
      data: data,
      args: args
    });
  };

  Logvac.prototype.info = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'INFO',
      styles: 'color:#87C45A',
      key: key,
      data: data,
      args: args
    });
  };

  Logvac.prototype.warn = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'WARN',
      styles: 'color:#FCF1AB',
      key: key,
      data: data,
      args: args
    });
  };

  Logvac.prototype.alert = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'ALERT',
      styles: 'color:#FEA06B',
      key: key,
      data: data,
      args: args
    });
  };

  Logvac.prototype.error = function() {
    var args, data, key;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return this.log({
      level: 'ERROR',
      styles: 'color:#F22C68',
      key: key,
      data: data,
      args: args
    });
  };

  Logvac.prototype.has_permission = function(level) {
    return _log_levels.indexOf(this.LOG_LEVEL) <= _log_levels.indexOf(level);
  };

  Logvac.prototype.log = function(options) {
    var log;
    log = {
      level: options.level,
      styles: options.styles,
      key: options.key,
      data: options.data,
      args: options.args,
      timestamp: new Date()
    };
    if (this.LOGS_ENABLED && this.has_permission(log.level)) {
      console.log("%cLogvac.log:" + log.level + " ::", log.styles, log.key, log.data);
    }
    return _backlog.push(log);
  };

  Logvac.prototype.backlog = function() {
    var i, len, log, results;
    results = [];
    for (i = 0, len = _backlog.length; i < len; i++) {
      log = _backlog[i];
      results.push(console.log("%c(" + log.timestamp + ") Logvac.backlog:" + log.level + " ::", log.styles, log.key + " - ", log.data));
    }
    return results;
  };

  Logvac.prototype.enable_logs = function() {
    this.warn("Logvac logs enabled");
    return this.LOGS_ENABLED = true;
  };

  Logvac.prototype.disable_logs = function() {
    this.warn("Logvac logs disabled");
    return this.LOGS_ENABLED = false;
  };

  Logvac._self = null;

  function Logvac(options1) {
    this.options = options1 != null ? options1 : {};
    if (this.constructor._self) {
      return this.constructor._self;
    }
    this.HOST = this.options.host || "";
    this.X_AUTH_TOKEN = this.options.auth_token || "";
    this.LOGS_ENABLED = this.options.logs_enabled || false;
    this.LOG_LEVEL = this.options.log_level || "DEBUG";
    this.on("logvac:_xhr.loadstart", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, evnt, args);
      };
    })(this));
    this.on("logvac:_xhr.abort", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, evnt, args);
      };
    })(this));
    this.on("logvac:_xhr.error", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.error(key, evnt, args);
      };
    })(this));
    this.on("logvac:_xhr.load", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.info(key, evnt, args);
      };
    })(this));
    this.on("logvac:_xhr.loadend", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, evnt, args);
      };
    })(this));
    this.constructor._self = this;
  }

  _events = {};

  Logvac.prototype._has_event = function(key) {
    return _events[key] != null;
  };

  Logvac.prototype._has_handler = function(key, handler) {
    return _events[key].indexOf(handler) !== -1;
  };

  Logvac.prototype._add_handler = function(key, handler) {
    _events[key] || (_events[key] = []);
    if (!this._has_handler(key, handler)) {
      return _events[key].push(handler);
    }
  };

  Logvac.prototype._remove_handler = function(key, handler) {
    if (!(this._has_event(key) && this._has_handler(key, handler))) {
      return;
    }
    return _events[key].splice(_events[key].indexOf(handler), 1);
  };

  Logvac.prototype.on = function(key, handler) {
    if (!(key && handler)) {
      return;
    }
    this._add_handler(key, handler);
    return handler;
  };

  Logvac.prototype.once = function(key, handler) {
    var handler_wrapper;
    handler_wrapper = (function(_this) {
      return function() {
        if (handler != null) {
          handler.apply(_this, arguments);
        }
        return _this.off(key, handler_wrapper);
      };
    })(this);
    return this.on(key, handler_wrapper);
  };

  Logvac.prototype.off = function(key, handler) {
    if (key && handler) {
      return this._remove_handler(key, handler);
    } else if (key) {
      return delete _events[key];
    } else {
      return _events = {};
    }
  };

  Logvac.prototype.fire = function() {
    var args, data, handler, i, key, len, ref;
    key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    if (!_events[key]) {
      return;
    }
    ref = _events[key];
    for (i = 0, len = ref.length; i < len; i++) {
      handler = ref[i];
      if (handler != null) {
        handler.apply(this, [key, data, args]);
      }
    }
    return true;
  };

  Logvac.prototype.events = function(key) {
    if (!key) {
      return this.log("Registered Events - ", _events);
    }
    if (this._has_event(key)) {
      return _events[key];
    } else {
      return this.log("Unknown event - ", key);
    }
  };

  Logvac.prototype.get = function(options) {
    var id, limit, start, tag, type;
    if (options == null) {
      options = {};
    }
    this._xhr = new XMLHttpRequest();
    this._xhr.onloadstart = (function(_this) {
      return function() {
        return _this.fire('logvac:_xhr.loadstart', _this._xhr.response);
      };
    })(this);
    this._xhr.onabort = (function(_this) {
      return function() {
        return _this.fire('logvac:_xhr.abort', _this._xhr.response);
      };
    })(this);
    this._xhr.onerror = (function(_this) {
      return function() {
        return _this.fire('logvac:_xhr.error', _this._xhr.response);
      };
    })(this);
    this._xhr.onload = (function(_this) {
      return function() {
        return _this.fire('logvac:_xhr.load', _this._xhr.response);
      };
    })(this);
    this._xhr.onloadend = (function(_this) {
      return function() {
        return _this.fire('logvac:_xhr.loadend', _this._xhr.response);
      };
    })(this);
    id = options.id || "";
    tag = options.tag || "";
    type = options.type || "";
    start = options.start || 0;
    limit = options.limit || 100;
    this._xhr.open('GET', this.HOST + "?id=" + id + "&tag=" + tag + "&type=" + type + "&start=" + start + "&limit=" + limit);
    this._xhr.setRequestHeader("x-auth-token", this.X_AUTH_TOKEN);
    this._xhr.send();
    return this._xhr;
  };

  Logvac.prototype.state = function() {
    var ref, ref1;
    switch ((ref = this._xhr) != null ? ref.readyState : void 0) {
      case 0:
        return 'unset';
      case 1:
        return 'opened';
      case 2:
        return 'headers recieved';
      case 3:
        return 'loading';
      case 4:
        return 'done';
      default:
        return "unknown state - " + ((ref1 = this._xhr) != null ? ref1.readyState : void 0);
    }
  };

  Logvac.prototype.done = function() {
    return this.state() === 'done';
  };

  Logvac.prototype.status = function() {
    var ref;
    return (ref = this._xhr) != null ? ref.status : void 0;
  };

  return Logvac;

})();
