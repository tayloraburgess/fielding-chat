import * as db from './db.js';

/**
  * Helper functions & middleware for main API routes.
  * @module api
*/

/**
  * Generates all errors in the API and passes them to the error-handling middleware.
  * Some errors, like 406 and 415, have stock messages.
  * Custom error messages are passed in via the body parameter.
*/
export function customError(status, methods, next, body) {
  let throwErr;
  if (status === 406) {
    throwErr = new Error('Invalid hypermedia type. Try Accept: "application/hal+json" instead.');
  } else if (status === 415) {
    throwErr = new Error('Invalid hypermedia type in your request. Try Content-Type: "application/hal+json" instead.');
  } else if (status === 500) {
    throwErr = new Error('The server failed to process your request--likely a database error. Our bad.');
  } else {
    throwErr = new Error(body);
  }
  throwErr.status = status;
  throwErr.methods = methods;
  throwErr.custom = true;
  next(throwErr);
}

/**
  * Middleware for HEAD requests for all routes.
  * Checks that the client can accept valid hypermedia, and sends 200 if so.
  * If not, sends 406 (invalid media type).
*/
export function genericHEAD(req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    res.status(200)
    .set({
      'Content-Type': 'application/hal+json',
      Allow: res.locals.methodsString,
    })
    .end();
  } else {
    customError(406, res.locals.methodsString, next);
  }
}

/**
  * Middleware for OPTIONS requests for all routes.
  * Sends a 200 response and a string of valid verbs (defined in reqCheckMethods()).
*/
export function genericOPTIONS(req, res) {
  res.status(200)
  .set({
    Allow: res.locals.methodsString,
  })
  .end();
}

/**
  * Middleware to check for valid HTTP methods.
  * Valid methods are stored in res.locals.methods in app.all() prior to calling this function.
  * Sends a 405 response is method is not in res.locals.methods.
*/
export function reqCheckMethods(req, res, next) {
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} ${req.path}. Try ${res.locals.methodsString} instead.`);
  }
}

/**
  * Middleware to check valid media types in 'Content-Type' request header.
  * Sends 415 if the meida type is invalid for the API.
*/
export function reqContentCheck(req, res, next) {
  if (req.is('application/hal+json') || req.is('application/json') || req.is('json')) {
    next();
  } else {
    customError(415, res.locals.methodsString, next);
  }
}

/**
  * Middleware to check valid media types in 'Accept' request header.
  * Sends 406 if the meida type is invalid for the API.
*/
export function reqAcceptCheck(req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    next();
  } else {
    customError(406, res.locals.methodsString, next);
  }
}

/**
  * Middleware to check that the request body type is an object (after being parsed by bodyParser).
  * If not an object, sends a 415 resonse.
*/
export function reqBodyObjectCheck(req, res, next) {
  if (req.body instanceof Object) {
    next();
  } else {
    customError(415, res.locals.methodsString, next);
  }
}

/**
  * Checks that the input property is in the request JSON body.
  * Must be run in between middleware in order to have 'property' parameter.
  * If the property exists, it passes on to the next middleware.
  * If it doesn't exist, it sends a 400 response.
*/
export function reqBodyPropertyCheck(property, req, res, next) {
  if (!(property in req.body)) {
    customError(400, res.locals.methodsString, next, `Your ${req.method} request to ${req.path} is missing a "${property}" property in the body.`);
  } else {
    next();
  }
}

/**
  * Middleware to get users from MongoDB using a wrapper function from module db.js.
  * Stores users in res.locals.users, which other middleware can access.
  * If there's a database error, return a 500 response.
*/
export function resGetUsers(req, res, next) {
  db.getUsers((err, usersRes) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.locals.users = usersRes;
      next();
    }
  });
}

/**
  * Middleware to get messages from MongoDB using a wrapper function from module db.js.
  * Stores messages in res.locals.messages, which other middleware can access.
  * If there's a database error, return a 500 response.
*/
export function resGetMessages(req, res, next) {
  db.getMessages((err, msgsRes) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.locals.messages = msgsRes;
      next();
    }
  });
}

/**
  * Middleware to get logs from MongoDB using a wrapper function from module db.js.
  * Stores messages in res.locals.logs, which other middleware can access.
  * If there's a database error, return a 500 response.
*/
export function resGetLogs(req, res, next) {
  db.getLogs((err, logsRes) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.locals.logs = logsRes;
      next();
    }
  });
}

/**
  * Gets users by a particular name from MongoDB using a wrapper function from module db.js.
  * Must be run in between middleware in order to have 'name' parameter.
  * Stores messages in res.locals.user, which other middleware can access.
  * If the database can't find the user, return a 404 response.
*/
export function resGetUserByName(name, req, res, next) {
  db.getUserByName(name, (err1, userRes) => {
    if (err1) {
      customError(404, res.locals.methodsString, next, `${name} isn't an existing user.`);
    } else {
      res.locals.user = userRes;
      next();
    }
  });
}

/**
  * Gets messages by a particular refId from MongoDB using a wrapper function from module db.js.
  * Must be run in between middleware in order to have 'refId' parameter.
  * Stores messages in res.locals.messages, which other middleware can access.
  * If the database can't find the message, return a 404 response.
*/
export function resGetMessageByRefId(refId, req, res, next) {
  db.getMessageByRefId(refId, (err, message) => {
    if (err) {
      customError(404, res.locals.methodsString, next, `${refId} isn't an existing message.`);
    } else {
      res.locals.message = message;
      next();
    }
  });
}

/**
  * Gets logs by a particular name from MongoDB using a wrapper function from module db.js.
  * Must be run in between middleware in order to have 'name' parameter.
  * Stores messages in res.locals.log, which other middleware can access.
  * If the database can't find the message, return a 404 response.
*/
export function resGetLogByName(name, req, res, next) {
  db.getLogByName(name, (err1, logRes) => {
    if (err1) {
      customError(404, res.locals.methodsString, next, `${name} isn't an existing log.`);
    } else {
      res.locals.log = logRes;
      next();
    }
  });
}
