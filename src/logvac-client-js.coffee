;class Logvac

  # constructor
  constructor : (@options={}) ->

    # check for dependencies
    if typeof(Eventify) == "undefined" || typeof(dash) == "undefined"
      console.warn "You are missing the following dependencies:
        \n\t#{if typeof(Eventify) == 'undefined' then 'Eventify (https://github.com/sdomino/eventify)' else ''}
        \n\t#{if typeof(dash) == 'undefined' then 'dash (https://github.com/sdomino/dash)' else ''}

        \n\nThe Logvac client will be unable to function properly until all dependencies are satisfied."
      return

    # add event capabilities
    Eventify.extend(@)

    # add logging capabilities
    dash.setPrefix("Logvac")
    dash.setLevel(@options.logLevel || "DEBUG")
    if @options.logsEnabled then dash.enableLogs()

    #
    @HOST           = @options.host || ""
    @X_AUTH_TOKEN   = @options.authToken || ""

    # httpRequest messages
    @on "logvac:_xhr.loadstart",  (key, data, args...) => dash.debug key, data, args
    @on "logvac:_xhr.progress",   (key, data, args...) => dash.debug key, data, args
    @on "logvac:_xhr.abort",      (key, data, args...) => dash.debug key, data, args
    @on "logvac:_xhr.error",      (key, data, args...) => dash.error key, data, args
    @on "logvac:_xhr.load",       (key, data, args...) => dash.info key, data, args
    @on "logvac:_xhr.loadend",    (key, data, args...) => dash.debug key, data, args

  ## api

  # get
  get: (options={}) ->

    #
    @_xhr = new XMLHttpRequest()

    # handle events
    @_xhr.onloadstart = => @fire 'logvac:_xhr.loadstart', @_xhr.response
    @_xhr.onprogress  = => @fire 'logvac:_xhr.progress', @_xhr.response
    @_xhr.onabort     = => @fire 'logvac:_xhr.abort', @_xhr.response
    @_xhr.onerror     = => @fire 'logvac:_xhr.error', @_xhr.response
    @_xhr.onload      = => @fire 'logvac:_xhr.load', @_xhr.response
    @_xhr.onloadend   = => @fire 'logvac:_xhr.loadend', @_xhr.response

    # set request options || default
    id    = options.id || ""
    type  = options.type || ""
    start = options.start || 0
    end   = options.end || 0
    limit = options.limit || 100

    # open the request; async by default
    @_xhr.open 'GET', "#{@HOST}?auth=#{@X_AUTH_TOKEN}&id=#{id}&type=#{type}&start=#{start}&end=#{end}&limit=#{limit}"

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
