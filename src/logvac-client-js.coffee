;class Logvac

  ## logs

  _backlog = [  ]
  _log_levels = [ 'DEBUG', 'INFO', 'WARN', 'ALERT', 'ERROR', 'SILENT' ]

  debug : (key, data, args...) -> @log({ level: 'DEBUG', styles: 'color:#48B5DA', key: key, data: data, args: args })
  info  : (key, data, args...) -> @log({ level: 'INFO',  styles: 'color:#87C45A', key: key, data: data, args: args })
  warn  : (key, data, args...) -> @log({ level: 'WARN',  styles: 'color:#FCF1AB', key: key, data: data, args: args })
  alert : (key, data, args...) -> @log({ level: 'ALERT', styles: 'color:#FEA06B', key: key, data: data, args: args })
  error : (key, data, args...) -> @log({ level: 'ERROR', styles: 'color:#F22C68', key: key, data: data, args: args })

  has_permission : (level) -> _log_levels.indexOf(@LOG_LEVEL) <= _log_levels.indexOf(level)

  log : (options) ->
    log = {
      level:     options.level
      styles:    options.styles
      key:       options.key
      data:      options.data
      args:      options.args
      timestamp: new Date()
    }

    console.log("%cLogvac.log:#{log.level} ::", log.styles, log.key, log.data) if @LOGS_ENABLED && @has_permission(log.level)

    _backlog.push log

  backlog : () ->
    for log in _backlog
      console.log("%c(#{log.timestamp}) Logvac.backlog:#{log.level} ::", log.styles, "#{log.key} - ", log.data)

  enable_logs : () -> @warn "Logvac logs enabled"; @LOGS_ENABLED = true
  disable_logs : () -> @warn "Logvac logs disabled"; @LOGS_ENABLED = false


  # constructor

  @_self = null

  #
  constructor : ( @options={} ) ->
    return @constructor._self if @constructor._self

    #
    @HOST           = @options.host || ""
    @X_AUTH_TOKEN   = @options.auth_token || ""
    @LOGS_ENABLED   = @options.logs_enabled || false
    @LOG_LEVEL      = @options.log_level || "DEBUG"

    # httpRequest messages
    @on "logvac:_xhr.loadstart",  (key, evnt, args...) => @debug key, evnt, args
    @on "logvac:_xhr.progress",   (key, evnt, args...) => @debug key, evnt, args
    @on "logvac:_xhr.abort",      (key, evnt, args...) => @debug key, evnt, args
    @on "logvac:_xhr.error",      (key, evnt, args...) => @error key, evnt, args
    @on "logvac:_xhr.load",       (key, evnt, args...) => @info key, evnt, args
    @on "logvac:_xhr.loadend",    (key, evnt, args...) => @debug key, evnt, args

    #
    @constructor._self = @


  ## events

  _events = {}

  # checks if a given [key] is a registered
  _has_event : (key) -> _events[key]?

  # checks if a given [handler] is registered on a [key]
  _has_handler : (key, handler) -> _events[key].indexOf(handler) != -1

  # add event handler unless it's already present
  _add_handler : (key, handler) ->
    _events[key] ||= []
    _events[key].push handler unless @_has_handler(key, handler)

  # removes given [handler] from [key]
  _remove_handler: (key, handler) ->
    return unless @_has_event(key) && @_has_handler(key, handler)
    _events[key].splice(_events[key].indexOf(handler), 1)

  # registers an event [handler] to a [key]
  on : (key, handler) ->
    return unless key && handler
    @_add_handler(key, handler)
    handler

  # registers an event [handler] to a [key], which once called will be unregistered
  once : (key, handler) ->
    handler_wrapper = =>
      handler?.apply(@, arguments)
      @off(key, handler_wrapper)
    @on(key, handler_wrapper)

  # if [key] and [handler] are provided, unregister [handler] from [key]. If only
  # [key] provided, unregister all [handler]s from [key]. If no arguments provided
  # unregister all events
  off : (key, handler) ->
    if (key && handler) then @_remove_handler(key, handler)
    else if key then delete _events[key]
    else _events = {}

  # fire an event by its registered [key]
  fire : (key, data, args...) ->
    return unless _events[key]
    handler?.apply @, [key, data, args] for handler in _events[key]
    true

  # if [key] is provided, list all registered [handler]s for [key].
  # If no [key] is provided, list all registered [key]s and corresponding [handler]s
  events : (key) ->
    return @log "Registered Events - ", _events unless key
    if @_has_event(key) then _events[key] else @log "Unknown event - ", key


  ## api

  #
  get: (options={}) ->

    #
    @_xhr = new XMLHttpRequest()

    # handle events
    @_xhr.onloadstart = => @fire 'logvac:_xhr.loadstart', @_xhr.response
    @_xhr.onprogress = => @fire 'logvac:_xhr.progress', @_xhr.response
    @_xhr.onabort = => @fire 'logvac:_xhr.abort', @_xhr.response
    @_xhr.onerror = => @fire 'logvac:_xhr.error', @_xhr.response
    @_xhr.onload = => @fire 'logvac:_xhr.load', @_xhr.response
    @_xhr.onloadend = => @fire 'logvac:_xhr.loadend', @_xhr.response

    # set request options || default
    id    = options.id || ""
    tag   = options.tag || ""
    type  = options.type || ""
    start = options.start || 0
    limit = options.limit || 100

    # open the request; async by default
    @_xhr.open 'GET', "#{@HOST}?id=#{id}&tag=#{tag}&type=#{type}&start=#{start}&limit=#{limit}"

    # set the auth header
    @_xhr.setRequestHeader("x-auth-token", @X_AUTH_TOKEN)

    # send the request
    @_xhr.send()

    # return the request
    @_xhr

  # state returns the state of the xhr
  state : () ->
    switch @_xhr?.readyState
      when 0 then 'unset'
      when 1 then 'opened'
      when 2 then 'headers recieved'
      when 3 then 'loading'
      when 4 then 'done'
      else "unknown state - #{@_xhr?.readyState}"

  # returns whether or not the xhr is done
  done : () -> (@state() == 'done')

  # status returns the status of the xhr
  status : () -> @_xhr?.status
