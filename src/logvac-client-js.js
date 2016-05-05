var Logvac,
  slice = [].slice;

Logvac = (function() {
  function Logvac(options1) {
    this.options = options1 != null ? options1 : {};
    if (typeof Eventify === "undefined" || typeof Logify === "undefined") {
      console.warn("You are missing the following dependencies: \n\t" + (typeof Eventify === 'undefined' ? 'Eventify (https://github.com/sdomino/eventify)' : '') + " \n\t" + (typeof Logify === 'undefined' ? 'Logify (https://github.com/sdomino/logify)' : '') + " \n\nThe Logvac client will be unable to function properly until all dependencies are satisfied.");
      return;
    }
    Eventify.extend(this);
    dash.setPrefix("Logvac");
    dash.setLevel(this.options.logLevel || "DEBUG");
    if (this.options.logsEnabled) {
      dash.enableLogs();
    }
    this.HOST = this.options.host || "";
    this.X_AUTH_TOKEN = this.options.authToken || "";
    this.on("logvac:_xhr.loadstart", (function(_this) {
      return function() {
        var args, evnt, key;
        key = arguments[0], evnt = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return _this.debug(key, evnt, args);
      };
    })(this));
    this.on("logvac:_xhr.progress", (function(_this) {
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
  }

  Logvac.prototype.get = function(options) {
    var end, id, limit, start, tag, type;
    if (options == null) {
      options = {};
    }
    this._xhr = new XMLHttpRequest();
    this._xhr.onloadstart = (function(_this) {
      return function() {
        return _this.fire('logvac:_xhr.loadstart', _this._xhr.response);
      };
    })(this);
    this._xhr.onprogress = (function(_this) {
      return function() {
        return _this.fire('logvac:_xhr.progress', _this._xhr.response);
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
    end = options.end || 0;
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
