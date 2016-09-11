import * as db from './db.js';

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

export function genericOPTIONS(req, res) {
  res.status(200)
  .set({
    Allow: res.locals.methodsString,
  })
  .end();
}

export function reqCheckMethods(req, res, next) {
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} ${req.path}. Try ${res.locals.methodsString} instead.`);
  }
}

export function reqContentCheck(req, res, next) {
  if (req.is('application/hal+json') || req.is('application/json') || req.is('json')) {
    next();
  } else {
    customError(415, res.locals.methodsString, next);
  }
}

export function reqAcceptCheck(req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    next();
  } else {
    customError(406, res.locals.methodsString, next);
  }
}

export function reqBodyObjectCheck(req, res, next) {
  if (req.body instanceof Object) {
    next();
  } else {
    customError(415, res.locals.methodsString, next);
  }
}

export function reqBodyPropertyCheck(property, req, res, next) {
  if (!(property in req.body)) {
    customError(400, res.locals.methodsString, next, `Your ${req.method} request to ${req.path} is missing a "${property}" property in the body.`);
  } else {
    next();
  }
}

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
