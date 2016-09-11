# api

Helper functions & middleware for main API routes.



* * *

### api.customError() 

Generates all errors in the API and passes them to the error-handling middleware.
Some errors, like 406 and 415, have stock messages.
Custom error messages are passed in via the body parameter.



### api.genericHEAD() 

Middleware for HEAD requests for all routes.
Checks that the client can accept valid hypermedia, and sends 200 if so.
If not, sends 406 (invalid media type).



### api.genericOPTIONS() 

Middleware for OPTIONS requests for all routes.
Sends a 200 response and a string of valid verbs (defined in reqCheckMethods()).



### api.reqCheckMethods() 

Middleware to check for valid HTTP methods.
Valid methods are stored in res.locals.methods in app.all() prior to calling this function.
Sends a 405 response is method is not in res.locals.methods.



### api.reqContentCheck() 

Middleware to check valid media types in 'Content-Type' request header.
Sends 415 if the meida type is invalid for the API.



### api.reqAcceptCheck() 

Middleware to check valid media types in 'Accept' request header.
Sends 406 if the meida type is invalid for the API.



### api.reqBodyObjectCheck() 

Middleware to check that the request body type is an object (after being parsed by bodyParser).
If not an object, sends a 415 resonse.



### api.reqBodyPropertyCheck() 

Checks that the input property is in the request JSON body.
Must be run in between middleware in order to have 'property' parameter.
If the property exists, it passes on to the next middleware.
If it doesn't exist, it sends a 400 response.



### api.resGetUsers() 

Middleware to get users from MongoDB using a wrapper function from module db.js.
Stores users in res.locals.users, which other middleware can access.
If there's a database error, return a 500 response.



### api.resGetMessages() 

Middleware to get messages from MongoDB using a wrapper function from module db.js.
Stores messages in res.locals.messages, which other middleware can access.
If there's a database error, return a 500 response.



### api.resGetLogs() 

Middleware to get logs from MongoDB using a wrapper function from module db.js.
Stores messages in res.locals.logs, which other middleware can access.
If there's a database error, return a 500 response.



### api.resGetUserByName() 

Gets users by a particular name from MongoDB using a wrapper function from module db.js.
Must be run in between middleware in order to have 'name' parameter.
Stores messages in res.locals.user, which other middleware can access.
If the database can't find the user, return a 404 response.



### api.resGetMessageByRefId() 

Gets messages by a particular refId from MongoDB using a wrapper function from module db.js.
Must be run in between middleware in order to have 'refId' parameter.
Stores messages in res.locals.messages, which other middleware can access.
If the database can't find the message, return a 404 response.



### api.resGetLogByName() 

Gets logs by a particular name from MongoDB using a wrapper function from module db.js.
Must be run in between middleware in order to have 'name' parameter.
Stores messages in res.locals.log, which other middleware can access.
If the database can't find the message, return a 404 response.




* * *










