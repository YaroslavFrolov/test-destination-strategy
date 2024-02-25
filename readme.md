# **Start application**

- Clone repo

- Create the `.env` file in root of project with next content:

  ```bash
    PORT=
    JWT_SECRET=
    DEFAULT_STRATEGY=
  ```

  see the `.env.example` file as example.

- Execute `docker-compose up`

- Login to app. Execute POST requests to `http://localhost:{PORT}/jwt/login` with next body

  ```json
  {
    "name": ...,
    "password": ...
  }
  ```

  I've sent name/password in private message.

  In response you will get a `token`. Save it to clipboard. TTL is 1 hour.

- Now you can make POST requests to `http://localhost:{PORT}/api/event` with body according to task, for example:

  ```json
  {
    "payload": 333,
    "possibleDestinations": [
      {
        "destination1": true,
        "destination2": true,
        "destination3": true
      },
      {
        "destination1": true,
        "destination3": false
      },
      {
        "destination1": true,
        "destination2": true,
        "destination4": false
      },
      {
        "destination5": true
      }
    ]
  }
  ```

<br />
<br />
<br />

# **Task description**, [original text](https://gist.github.com/yetithefoot/96899b317d90c90a7034f92e885d5850)

- We need to develop a router-app that handles incoming events and routes them to one or multiple destinations. To receive events app exposes a simple HTTP-endpoint, whereto authorized clients may send HTTP-requests. App should operate according to the specified destinations config and routing strategy. Custom strategy might be specified in client request.

- App should authorize incoming requests via JWT tokens.

## Event

Incoming HTTP-request body contains the `event` object.
Event contains data represented by `payload` property, this `payload` will be (or not) routed to one of destinations.
Event also contains routing metadata represented by `possibleDestinations` property, will be used by strategy to decide destination to route to. Property `possibleDestinations` is an array of routing intents, filled up by undefined random logic. App should analyze this array according to specified `destinations` config and `strategy` and decide if message should be sent or not.

_Example HTTP request body:_

```js
{
	// required payload that should be routed to destinations
	payload: { a:1, b:2, c:3 /* any data */ },
	// array or destination intents
	possibleDestinations: [
		{
			destination1: true,
			destination2: false,
			destination3: true
		},
		{
			destination1: true,
			destination2: false,
			destination4: false
		},
		{
			destination3: true
		},
		…
	],
	// optional strategy string 'all', string 'any' or string serialized JS function that represent custom client defined strategy. When not specified, default app strategy will be used.
	strategy: 'ALL' | 'ANY' | 'function(possibleDestinations) { return true; }'

}
```

## Strategies

App uses `strategy` to decide routing according to strategy:
• `ALL` strategy — according to this strategy event should be routed to destination, if _all intents_ for this destination is `true`.
• `ANY` strategy — according to this strategy event should be routed to destination, if _any intent_ for this destination is `true`.
• custom client defined strategy — according to this strategy event should be routed to destination, if specified serialized function returns true.

Default strategy should be specified at app start and applied every time when client HTTP-request doesn't specify one.

## Destinations

Since events doesn't contain extensive destination info but only destination names, app should be initialized with destinations dictionary at start. Example:

```js
[
  {
	// destination unique name, matches `possibleDestinations` property names
	name: 'destination1',
	// transport type
	transport: 'http.post'
	// address to send payload to if http.* transport in use
	url: 'https://example.com/destination1',
  },
  {
	// destination unique name, matches `possibleDestinations` property names
	name: 'destination2',
	// transport type
	transport: 'http.post'
	// address to send payload to if http.* transport in use
	url: 'https://example2.com/destination2',
},
{
	// destination unique name, matches `possibleDestinations` property names
	name: 'destination3',
	// transport type
	transport: 'console.log'
  },
  {
	// destination unique name, matches `possibleDestinations` property names
	name: 'destination4',
	// transport type
	transport: 'console.warn'
  },
  ...
]
```

To route an event, app must send specified `payload` to the specified transport.

## Transports

There are various builtin transports: http.post, https.put, http.get, console.log, console.warn etc. For http.\* transports additional param `url` should be present. Keep in mind that we probably want to extend list of possible transports in future.

## Error handling

App should handle possible errors in configuration and input data. It should be resilent to possible abuse. It should provide clear instructions to fix the error and write logs that helps with the debug.

## Logging

Every request and it's response should be logged into MongoDB database collection. It should contain original request and response in the same document.

## Deployment

App should be distributed into Docker container with a clear setup instructions.
