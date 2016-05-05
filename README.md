The logvac javascript client provides a simple API for requesting logs from [logvac](https://github.com/nanopack/logvac). As the client makes requests from logvac it will fire corresponding events throughout the lifecycle of the request. Once complete it will fire a final request with the response data that can be handled however you wish.

## New Client

Creating a new client is very easy, and only has a small amount of configurable options:

```coffeescript

# logs are disabled by default and set to "DEBUG"
options = {
  logs_enabled : true
  log_level : "INFO" # 'DEBUG', 'INFO', 'WARN', 'ALERT', 'ERROR', 'SILENT'
  host: "http://127.0.0.1:1234"
  x_auth_token: "TOKEN"
}

#
logvac = new Logvac(options)
```

## Available Commands

The logvac client comes with two sets of commands:

#### Client specific commands

Client specific commands deal specifically with requesting logs from logvac, and the state of the request:

| Command | Description | Example |
| --- | --- | --- |
| `get` | get logs from logvac | `logvac.get(options)` |
| `state` | returns the state of the last known operation | `logvac.state()` |
| `done` | returns whether or not the last known operation is done | `logvac.done()` |
| `status` | returns the status code of the last known operation | `logvac.status()` |

##### GET options
| Option | Description | Default |
| --- | --- |
| `id` | get logs of id `id` | "" |
| `type` | get logs of type `type` | "app" |
| `start` | return `limit` number of logs from `start` backwards | 0ns |
| `end` | return `limit` amount of logs from `start` to `end` | 0ns |
| `limit` | return `limit` amount of logs | 100 |

#### Event specific commands

The logvac client also comes with its own built in event system. These commands allow you to leverage the system to create any types of events you want based on what data you get back from logvac:

| Command | Description | Example |
| --- | --- | --- |
| `on` | handle event | `logvac.on(key, handler)` |
| `once` | handle event once | `logvac.once(key, handler)` |
| `off` | stop handling event | `logvac.off(key, handler)` |
| `fire` | fire event | `logvac.fire(key, data, args...)` |
| `events` | list events | `logvac.events(key)` |

##### Examples:

```coffeescript

# handle an event
logvac.once "logvac:event", (key, data, args...) => # do this only once
logvac.on "logvac:event", (key, data, args...) => # do this every fire

# fire an event
logvac.fire "logvac:event", data
```

## Client events

| Command | Fired when |
| --- | --- |
| `logvac:_xhr.loadstart` | the operation begins |
| `logvac:_xhr.progress` | after loadstart before loadend (0 or more times) |
| `logvac:_xhr.abort` | the operation was canceled by the user |
| `logvac:_xhr.error` | the operation failed to complete |
| `logvac:_xhr.load` | the operation completed successfully |
| `logvac:_xhr.loadend` | the operation is complete for ANY reason (always follows abort, error, or load) |

## Data format

This is what a logvac entry might look like:

```JSON
{
  "id": "my-app",
  "tag": "build-1234",
  "type": "deploy",
  "priority": "4",
  "message": "$ mv nanobox/.htaccess .htaccess\n[✓] SUCCESS"
}
```


## Logvac adapter

A logvac "adapter" is nothing more than a grouping of logvac event handlers that tailor logvac events to a specific framework or library (Angular, React, ect...).

You can have one adapter that does it all, or perhaps multiple adapters, or even no adapter and just handle specific events as needed. It all really depends on the size/scale and architecture of you application.

```coffeescript

#
class exampleLogvacAdapter

  #
  constructor : ( @options={} ) ->

    #
    logvac.on "logvac:_xhr.loadstart", (key, data, args...) =>
      # the request has been sent

    #
    logvac.on "logvac:_xhr.progress", (key, data, args...) =>
      # monitor progress of the request

    #
    logvac.on "logvac:_xhr.load",  (key, data, args...) =>
      # the request is complete and you have your data

    #
    logvac.on "logvac:_xhr.error", (key, data, args...) =>
      # the request failed and you might want to do something
```

## Contributing

Contributions to the logvac js client are welcome and encouraged. This is a [Nanobox](https://nanobox.io) project and contributions should follow the [Nanobox Contribution Process & Guidelines](https://docs.nanobox.io/contributing/).

[![open source](http://nano-assets.gopagoda.io/open-src/nanobox-open-src.png)](http://nanobox.io/open-source)
