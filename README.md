# fielding-chat

[![Build Status](https://travis-ci.org/tayloraburgess/fielding-chat.svg?branch=master)](https://travis-ci.org/tayloraburgess/fielding-chat)

A RESTful API chat server. Built using [node.js](https://nodejs.org/), [express.js](http://expressjs.com/), [babel](https://babeljs.io/) (for ES6 compilation), [MongoDB](https://www.mongodb.com/), and [mocha](http://mochajs.org/) (for testing).

## Development 

1. Fork this repository, and clone into an appropriate directory.

2. [Install node.js](https://nodejs.org/en/download/) and [MongoDB](https://www.mongodb.com/download-center?jmp=nav), if you haven't already.

3. Install dependencies:

	```
	$ npm install
	```
4. To start the development server locally:

	```
	$ npm start
	```

	You can send requests to the local instance using cURL (or a similar program) like this:

	```
	$ curl -i localhost:5000/api/v1
	```
5. To test:

	```
	$ npm test
	```

6. To build (i.e. compile ES6 to ES5):

	```
	$ npm run-script babel
	```

	This will compile all .js files in the ./src directory to ./lib. You can run the compiled server using:

	```
	$ npm run-script serve
	```
7. Further documentation for API functions is in the ./docs directory.

## API

This API is simple. It has three primary resource paths:

- /api/v1/users
- /api/v1/messages
- /api/v1/logs

The server sends resource representations as [application/hal+json](http://stateless.co/hal_specification.html) responses. If you're not familiar with that format, don't worry--it's a lot like [application/json](https://tools.ietf.org/html/rfc4627), and can be parsed identically. It just extends the media in useful ways, like adding a standard "_links" property.

If you'd like to explore without reading further, start with a GET, HEAD, or OPTIONS request to https://fielding-chat.herokuapp.com/api/v1. You can discover the full API by following related "_links". However, the documentation is still here to help out.

### /api/v1/users

Users are the core API resource. If you send a GET request to this endpoint, you'll receive a list of URLs to existing users in response. You can also POST to this endpoint to create a new user. Your POST data should look something like this (with the "Content-Type" header set to "application/hal+json" or "application/json"):

```
{
	"name": "a string"
}
```

#### /api/v1/users/:name

Once you have a list of user URLs, or have created some users, you can GET their representation at this endpoint. You can also:

- PUT updated user information to this endpoint (using the same template as POST above). You'll receive a URL for the updated resource in response.
- DELETE the user resource (note: this will also delete any messages associated with the user and remove the users from any associated logs)

### /api/v1/messages

Messages contain text, and are attached to a particular user. To get a list of existing messages, send a GET request to this endpoint. Like /api/v1/users, you can also POST to this endpoint to create a new message. Follow this data format for POST:

```
{
	"user": "an existing user name",
	"text" "a string"
}
```

If the user you supply doesn't exist, you'll get an error.

#### /api/v1/messages/:ref_id

Messages don't have names or titles, but you can find them using their "refId", which is a number the server automatically generates when it creates a new message. When you POST a new message, you'll receive a URL in response containing its refId. The list of messages you can GET from /api/v1/messages also contain refId URLs.

At this endpoint, you can:

- GET a representation of the message
- PUT updated message information. You should use the POST template from /api/v1/messages--however, you can leave out a property if you want, say, to only update the "text" but not the "user".
- DELETE the message resource (note: this will also remove the message from any associated logs)

### /api/v1/logs

Logs are highest-level resource in the API. Each log has a name, and also has a list of users and a list of messages. It's up to you how to use that represented information, though. For example, logs can have an unlimited number of users in their 'users' property--but you could articifically limit it to just two users in your application if you don't want group chats. Essentially, logs are what allow users to share a stream of messages with each other--but it's a bit open-ended.

Like the other endpoints, you can POST in this format:

```
{
	"name": "a string",
	"users": ["an existing user name", "another existing user name", ...],
	"messages": ["an existing message refId", "another existing message refId", ...]
}
```

#### /api/v1/logs/:name

At this endpoint, you can:

- GET a representation of the log
- PUT updated log information. You should use the POST template from /api/v1/logs--however, like api/v1/messages/:ref_id, you can leave out a property if you want, say, to only update the "name" but not the "users" or "messages". The "users" and "messages" properties must be JSON arrays.
- DELETE the log resource