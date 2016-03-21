;class Logvac

  # constructor
  constructor : (@options={}) ->

    # check for dependencies
    if typeof(Eventify) == "undefined" || typeof(Logify) == "undefined"
      console.warn "You are missing the following dependencies:
        \n\t#{if typeof(Eventify) == 'undefined' then 'Eventify (https://github.com/sdomino/eventify)' else ''}
        \n\t#{if typeof(Logify) == 'undefined' then 'Logify (https://github.com/sdomino/logify)' else ''}

        \n\nThe Logvac client will be unable to function properly until all dependencies are satisfied."
      return

    # add event capabilities
    Eventify.enhance(@)

    # add logging capabilities
    Logify.enhance(@)
    @logName = "[Logvac]"
    @logLevel = @options.logLevel || "DEBUG"
    @logsEnabled = @options.logsEnabled || false

    #
    @HOST           = @options.host || ""
    @X_AUTH_TOKEN   = @options.authToken || ""

    # httpRequest messages
    @on "logvac:_xhr.loadstart",  (key, evnt, args...) => @debug key, evnt, args
    @on "logvac:_xhr.progress",   (key, evnt, args...) => @debug key, evnt, args
    @on "logvac:_xhr.abort",      (key, evnt, args...) => @debug key, evnt, args
    @on "logvac:_xhr.error",      (key, evnt, args...) => @error key, evnt, args
    @on "logvac:_xhr.load",       (key, evnt, args...) => @info key, evnt, args
    @on "logvac:_xhr.loadend",    (key, evnt, args...) => @debug key, evnt, args

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
