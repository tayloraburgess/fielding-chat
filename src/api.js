/* eslint-env node */

import 'babel-polyfill';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as db from './db.js';

const app = express();
const jsonParser = bodyParser.json();

function customError(status, methods, next, body) {
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

function genericHEAD(req, res, next) {
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

function genericOPTIONS(req, res) {
  res.status(200)
  .set({
    Allow: res.locals.methodsString,
  })
  .end();
}

function reqCheckMethods(req, res, next) {
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} ${req.path}. Try ${res.locals.methodsString} instead.`);
  }
}

function reqContentCheck(req, res, next) {
  if (req.is('application/hal+json') || req.is('application/json') || req.is('json')) {
    next();
  } else {
    customError(415, res.locals.methodsString, next);
  }
}

function reqAcceptCheck(req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    next();
  } else {
    customError(406, res.locals.methodsString, next);
  }
}

function reqBodyObjectCheck(req, res, next) {
  if (req.body instanceof Object) {
    next();
  } else {
    customError(415, res.locals.methodsString, next);
  }
}

function reqBodyPropertyCheck(property, req, res, next) {
  if (!(property in req.body)) {
    customError(400, res.locals.methodsString, next, `Your ${req.method} request to ${req.path} is missing a "${property}" property in the body.`);
  } else {
    next();
  }
}

function resGetUsers(req, res, next) {
  db.getUsers((err, usersRes) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.locals.users = usersRes;
      next();
    }
  });
}

function resGetMessages(req, res, next) {
  db.getMessages((err, msgsRes) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.locals.messages = msgsRes;
      next();
    }
  });
}

function resGetLogs(req, res, next) {
  db.getLogs((err, logsRes) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.locals.logs = logsRes;
      next();
    }
  });
}

function resGetUserByName(name, req, res, next) {
  db.getUserByName(name, (err1, userRes) => {
    if (err1) {
      customError(404, res.locals.methodsString, next, `${name} isn't an existing user.`);
    } else {
      res.locals.user = userRes;
      next();
    }
  });
}

function resGetMessageByRefId(refId, req, res, next) {
  db.getMessageByRefId(refId, (err, message) => {
    if (err) {
      customError(404, res.locals.methodsString, next, `${refId} isn't an existing message.`);
    } else {
      res.locals.message = message;
      next();
    }
  });
}

function resGetLogByName(name, req, res, next) {
  db.getLogByName(name, (err1, logRes) => {
    if (err1) {
      customError(404, res.locals.methodsString, next, `${name} isn't an existing log.`);
    } else {
      res.locals.log = logRes;
      next();
    }
  });
}

app.all('/api/v1', (req, res, next) => {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET'];
  next();
}, reqCheckMethods);

app.head('/api/v1', genericHEAD);

app.options('/api/v1', genericOPTIONS);

app.get('/api/v1', reqAcceptCheck, (req, res) => {
  res.status(200)
  .set({
    'Content-Type': 'application/hal+json',
    Allow: res.locals.methodsString,
  })
  .json({
    _links: {
      self: { href: '/api/v1' },
      related: [
        { href: '/api/v1/users' },
        { href: '/api/v1/messages' },
        { href: '/api/v1/logs' },
      ],
    },
  });
});

app.all('/api/v1/users', (req, res, next) => {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'POST'];
  next();
}, reqCheckMethods);

app.head('/api/v1/users', genericHEAD);

app.options('/api/v1/users', genericOPTIONS);

app.get('/api/v1/users', reqAcceptCheck, resGetUsers, (req, res) => {
  const items = res.locals.users.map((user) => {
    return { href: `/api/v1/users/${user.name}` };
  });
  res.status(200)
  .set({
    'Content-Type': 'application/hal+json',
    Allow: res.locals.methodsString,
  })
  .json({
    _links: {
      self: { href: '/api/v1/users' },
      item: items,
    },
  });
});

app.post('/api/v1/users', reqContentCheck, jsonParser, reqBodyObjectCheck, (req, res, next) => {
  reqBodyPropertyCheck('name', req, res, next);
}, (req, res, next) => {
  db.createUser(req.body.name, (err, userRes) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.status(201)
      .location(`/api/v1/users/${userRes.name}`)
      .end();
    }
  });
});

app.all('/api/v1/users/:name', (req, res, next) => {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'PUT', 'DELETE'];
  next();
}, reqCheckMethods, (req, res, next) => {
  resGetUserByName(req.params.name, req, res, next);
});

app.head('/api/v1/users/:name', genericHEAD);

app.options('/api/v1/users/:name', genericOPTIONS);

app.delete('/api/v1/users/:name', (req, res, next) => {
  db.deleteUser(res.locals.user._id, (err) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.status(204)
      .end();
    }
  });
});

app.get('/api/v1/users/:name', reqAcceptCheck, resGetMessages, (req, res) => {
  const messageItems = res.locals.messages.filter((message) => {
    if (message.user_id.toString() === res.locals.user._id.toString()) {
      return message;
    }
    return false;
  }).map((message) => {
    return { href: `/api/v1/messages/${message.ref_id}` };
  });
  res.status(200)
  .set({
    'Content-Type': 'application/hal+json',
    Allow: res.locals.methodsString,
  })
  .json({
    _links: {
      self: { href: `/api/v1/users/${req.params.name}` },
      collection: { href: '/api/v1/users' },
      related: messageItems,
    },
    name: res.locals.user.name,
    createdAt: res.locals.user.created_at,
  });
});

app.put('/api/v1/users/:name', reqContentCheck, jsonParser, reqBodyObjectCheck, (req, res, next) => {
  if ('name' in req.body) {
    db.updateUserName(res.locals.user._id, req.body.name, (err) => {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        res.locals.newUserName = req.body.name;
        next();
      }
    });
  } else {
    res.locals.newUserName = res.locals.user.name;
    next();
  }
}, (req, res) => {
  res.status(200)
  .location(`/api/v1/users/${res.locals.newUserName}`)
  .end();
});

app.all('/api/v1/messages', (req, res, next) => {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'POST'];
  next();
}, reqCheckMethods);

app.head('/api/v1/messages', genericHEAD);

app.options('/api/v1/messages', genericOPTIONS);

app.get('/api/v1/messages', reqAcceptCheck, resGetMessages, (req, res) => {
  const items = res.locals.messages.map((message) => {
    return { href: `/api/v1/messages/${message.ref_id}` };
  });
  res.status(200)
  .set({
    'Content-Type': 'application/hal+json',
    Allow: res.locals.methodsString,
  })
  .json({
    _links: {
      self: { href: '/api/v1/messages' },
      item: items,
    },
  });
});

app.post('/api/v1/messages', reqContentCheck, jsonParser, reqBodyObjectCheck, (req, res, next) => {
  reqBodyPropertyCheck('user', req, res, next);
}, (req, res, next) => {
  reqBodyPropertyCheck('text', req, res, next);
}, (req, res, next) => {
  resGetUserByName(req.body.user, req, res, next);
}, (req, res, next) => {
  db.createMessage(res.locals.user._id, req.body.text, (err2, msgRes) => {
    if (err2) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.status(201)
      .location(`/api/v1/messages/${msgRes.ref_id}`)
      .end();
    }
  });
});

app.all('/api/v1/messages/:ref_id', (req, res, next) => {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'PUT', 'DELETE'];
  next();
}, reqCheckMethods, (req, res, next) => {
  resGetMessageByRefId(req.params.ref_id, req, res, next);
});

app.head('/api/v1/messages/:ref_id', genericHEAD);

app.options('/api/v1/messages/:ref_id', genericOPTIONS);

app.delete('/api/v1/messages/:ref_id', (req, res, next) => {
  db.deleteMessage(res.locals.message._id, (err) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.status(204)
      .end();
    }
  });
});

app.get('/api/v1/messages/:ref_id', reqAcceptCheck, (req, res, next) => {
  db.getUserById(res.locals.message.user_id, (err2, userRes) => {
    if (err2) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.locals.user = userRes;
      next();
    }
  });
}, resGetLogs, (req, res) => {
  const items = res.locals.logs.filter((log) => {
    const strMsgIds = log.message_ids.map((id) => {
      return id.toString();
    });
    if (strMsgIds.indexOf(res.locals.message._id.toString()) > -1) {
      return log;
    }
    return false;
  }).map((log) => {
    return { href: `/api/v1/logs/${log.name}` };
  });
  items.unshift({ href: 'api/v1/messages' });
  res.status(200)
  .set({
    'Content-Type': 'application/hal+json',
    Allow: res.locals.methodsString,
  })
  .json({
    _links: {
      self: { href: `/api/v1/messages/${req.params.ref_id}` },
      collection: items,
      related: { href: `/api/v1/users/${res.locals.user.name}` },
    },
    user: res.locals.user.name,
    text: res.locals.message.text,
    createdAt: res.locals.message.created_at,
  });
});

app.put('/api/v1/messages/:ref_id', reqContentCheck, jsonParser, reqBodyObjectCheck, (req, res, next) => {
  if ('user' in req.body) {
    db.getUserByName(req.body.user, (err1, userRes) => {
      if (err1) {
        customError(404, res.locals.methodsString, next, `${req.body.user} isn't an existing user.`);
      } else {
        db.updateMessageUser(res.locals.message._id, userRes._id, (err2) => {
          if (err2) {
            customError(500, res.locals.methodsString, next);
          } else {
            next();
          }
        });
      }
    });
  } else {
    next();
  }
}, (req, res, next) => {
  if ('text' in req.body) {
    db.updateMessageText(res.locals.message._id, req.body.text, (err) => {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        next();
      }
    });
  } else {
    next();
  }
}, (req, res) => {
  res.status(200)
  .location(`/api/v1/messages/${res.locals.message.ref_id}`)
  .end();
});

app.all('/api/v1/logs', (req, res, next) => {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'POST'];
  next();
}, reqCheckMethods);

app.head('/api/v1/logs', genericHEAD);

app.options('/api/v1/logs', genericOPTIONS);

app.get('/api/v1/logs', reqAcceptCheck, resGetLogs, (req, res) => {
  const items = res.locals.logs.map((log) => {
    return { href: `/api/v1/logs/${log.name}` };
  });
  res.status(200)
  .set({
    'Content-Type': 'application/hal+json',
    Allow: res.locals.methodsString,
  })
  .json({
    _links: {
      self: { href: '/api/v1/logs' },
      item: items,
    },
  });
});

app.post('/api/v1/logs', reqContentCheck, jsonParser, reqBodyObjectCheck, (req, res, next) => {
  reqBodyPropertyCheck('name', req, res, next);
}, (req, res, next) => {
  reqBodyPropertyCheck('users', req, res, next);
}, (req, res, next) => {
  reqBodyPropertyCheck('messages', req, res, next);
}, (req, res, next) => {
  if (!(Array.isArray(req.body.users))) {
    customError(400, res.locals.methodsString, next, 'The "users" property in your POST request body should be a JSON array.');
  } else if (!(Array.isArray(req.body.messages))) {
    customError(400, res.locals.methodsString, next, 'The "messages" property in your POST request body should be a JSON array.');
  } else {
    next();
  }
}, (req, res, next) => {
  resGetMessageByRefId(req.body.messages, req, res, next);
}, (req, res, next) => {
  resGetUserByName(req.body.users, req, res, next);
}, (req, res, next) => {
  const dbUsers = res.locals.user.map((user) => {
    return user._id;
  });
  const dbMsgs = res.locals.message.map((message) => {
    return message._id;
  });
  db.createLog(dbUsers, dbMsgs, req.body.name, (err, logRes) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.status(201)
      .location(`/api/v1/logs/${logRes.name}`)
      .end();
    }
  });
});

app.all('/api/v1/logs/:name', (req, res, next) => {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'PUT', 'DELETE'];
  next();
}, reqCheckMethods, (req, res, next) => {
  resGetLogByName(req.params.name, req, res, next);
});

app.head('/api/v1/logs/:name', genericHEAD);

app.options('/api/v1/logs/:name', genericOPTIONS);

app.delete('/api/v1/logs/:name', (req, res, next) => {
  db.deleteLog(res.locals.log._id, (err) => {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.status(204)
      .end();
    }
  });
});

app.get('/api/v1/logs/:name', reqAcceptCheck, resGetUsers, resGetMessages, (req, res) => {
  const strMsgIds = res.locals.log.message_ids.map((id) => {
    return id.toString();
  });
  const strUserIds = res.locals.log.user_ids.map((id) => {
    return id.toString();
  });
  const msgItems = res.locals.messages.filter((message) => {
    if (strMsgIds.indexOf(message._id.toString()) > -1) {
      return message;
    }
    return false;
  }).map((message) => {
    return message.ref_id.toString();
  });
  const userItems = res.locals.users.filter((user) => {
    if (strUserIds.indexOf(user._id.toString()) > -1) {
      return user;
    }
    return false;
  }).map((user) => {
    return user.name;
  });
  const items = userItems.map((user) => {
    return { href: `/api/v1/users/${user}` };
  }).concat(
    msgItems.map((msg) => {
      return { href: `/api/v1/messages/${msg}` };
    })
  );
  res.status(200)
  .set({
    'Content-Type': 'application/hal+json',
    Allow: res.locals.methodsString,
  })
  .json({
    _links: {
      self: { href: `/api/v1/logs/${req.params.name}` },
      collection: { href: 'api/v1/logs' },
      related: items,
    },
    name: res.locals.log.name,
    users: userItems,
    messages: msgItems,
    createdAt: res.locals.log.created_at,
  });
});

app.put('/api/v1/logs/:name', reqContentCheck, jsonParser, reqBodyObjectCheck, (req, res, next) => {
  if ('users' in req.body) {
    if (Array.isArray(req.body.users)) {
      db.getUserByName(req.body.users, (err1, userRes) => {
        if (err1) {
          customError(400, res.locals.methodsString, next, 'Invalid user names in PUT request body.');
        } else {
          let userIds;
          if (Array.isArray(userRes)) {
            userIds = userRes.map((user) => {
              return user._id;
            });
          } else {
            userIds = [userRes._id];
          }
          db.updateLogUsers(res.locals.log._id, userIds, (err2) => {
            if (err2) {
              customError(500, res.locals.methodsString, next);
            } else {
              next();
            }
          });
        }
      });
    } else {
      customError(400, res.locals.methodsString, next, 'The "users" property in your PUT request body should be a JSON array.');
    }
  } else {
    next();
  }
}, (req, res, next) => {
  if ('messages' in req.body) {
    if (Array.isArray(req.body.messages)) {
      db.getMessageByRefId(req.body.messages, (err1, msgRes) => {
        if (err1) {
          customError(400, res.locals.methodsString, next, 'Invalid message refIds in PUT request body.');
        } else {
          let msgIds;
          if (Array.isArray(msgRes)) {
            msgIds = msgRes.map((message) => {
              return message._id;
            });
          } else {
            msgIds = [msgRes];
          }
          db.updateLogUsers(res.locals.log._id, msgIds, (err2) => {
            if (err2) {
              customError(500, res.locals.methodsString, next);
            } else {
              next();
            }
          });
        }
      });
    } else {
      customError(400, res.locals.methodsString, next, 'The "messages" property in your PUT request body should be a JSON array.');
    }
  } else {
    next();
  }
}, (req, res, next) => {
  if ('name' in req.body) {
    db.updateLogName(res.locals.log._id, req.body.name, (err) => {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        res.locals.newLogName = req.body.name;
        next();
      }
    });
  } else {
    res.locals.newLogName = res.locals.log.name;
    next();
  }
}, (req, res) => {
  res.status(200)
  .location(`/api/v1/logs/${res.locals.newLogName}`)
  .end();
});

/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
/* eslint-enable no-unused-vars*/
  if (res.headersSent || !('custom' in err)) {
    next(err);
  } else {
    res.status(err.status)
    .set({
      Allow: err.methods,
    })
    .send(err.message);
  }
});

export default app;
