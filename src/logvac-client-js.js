var Logvac,
  slice = [].slice;

Logvac = (function() {
  function Logvac(options1) {
    this.options = options1 != null ? options1 : {};
    if (typeof Eventify === "undefined" || typeof dash === "undefined") {
      console.warn("You are missing the following dependencies: \n\t" + (typeof Eventify === 'undefined' ? 'Eventify (https://github.com/sdomino/eventify)' : '') + " \n\t" + (typeof dash === 'undefined' ? 'dash (https://github.com/sdomino/dash)' : '') + " \n\nThe Logvac client will be unable to function properly until all dependencies are satisfied.");
      return;
    }
    Eventify.extend(this);
    dash.setPrefix("Logvac");
    dash.setLevel(this.options.logLevel || "DEBUG");
    if (this.options.logsEnabled) {
      dash.enableLogs();
    }
    this.on("logvac:_xhr.loadstart", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("logvac:_xhr.progress", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("logvac:_xhr.abort", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
    this.on("logvac:_xhr.error", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.error(key, data, args);
      };
    })(this));
    this.on("logvac:_xhr.load", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.info(key, data, args);
      };
    })(this));
    this.on("logvac:_xhr.loadend", (function(_this) {
      return function() {
        var args, data, key;
        key = arguments[0], data = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return dash.debug(key, data, args);
      };
    })(this));
  }

  Logvac.prototype.get = function(options) {
    var end, id, limit, start, type;
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
    type = options.type || "";
    start = options.start || 0;
    end = options.end || 0;
    limit = options.limit || 100;
    this._xhr.open('GET', this.options.host + "?auth=" + this.options.auth + "&id=" + id + "&type=" + type + "&start=" + start + "&end=" + end + "&limit=" + limit);
    this._xhr.setRequestHeader("x-auth-token", this.options.auth);
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
