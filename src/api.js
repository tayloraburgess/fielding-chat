/* eslint-env node */

import 'babel-polyfill';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as api from './api-functions.js';
import * as db from './db.js';

const app = express();
const jsonParser = bodyParser.json();

app.all('/api/v1', (req, res, next) => {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET'];
  next();
}, api.reqCheckMethods);

app.head('/api/v1', api.genericHEAD);

app.options('/api/v1', api.genericOPTIONS);

app.get('/api/v1', api.reqAcceptCheck, (req, res) => {
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
}, api.reqCheckMethods);

app.head('/api/v1/users', api.genericHEAD);

app.options('/api/v1/users', api.genericOPTIONS);

app.get('/api/v1/users', api.reqAcceptCheck, api.resGetUsers, (req, res) => {
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

app.post('/api/v1/users', api.reqContentCheck, jsonParser, api.reqBodyObjectCheck, (req, res, next) => {
  api.reqBodyPropertyCheck('name', req, res, next);
}, (req, res, next) => {
  db.createUser(req.body.name, (err, userRes) => {
    if (err) {
      api.customError(500, res.locals.methodsString, next);
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
}, api.reqCheckMethods, (req, res, next) => {
  api.resGetUserByName(req.params.name, req, res, next);
});

app.head('/api/v1/users/:name', api.genericHEAD);

app.options('/api/v1/users/:name', api.genericOPTIONS);

app.delete('/api/v1/users/:name', (req, res, next) => {
  db.deleteUser(res.locals.user._id, (err) => {
    if (err) {
      api.customError(500, res.locals.methodsString, next);
    } else {
      res.status(204)
      .end();
    }
  });
});

app.get('/api/v1/users/:name', api.reqAcceptCheck, api.resGetMessages, (req, res) => {
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

app.put('/api/v1/users/:name', api.reqContentCheck, jsonParser, api.reqBodyObjectCheck, (req, res, next) => {
  if ('name' in req.body) {
    db.updateUserName(res.locals.user._id, req.body.name, (err) => {
      if (err) {
        api.customError(500, res.locals.methodsString, next);
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
}, api.reqCheckMethods);

app.head('/api/v1/messages', api.genericHEAD);

app.options('/api/v1/messages', api.genericOPTIONS);

app.get('/api/v1/messages', api.reqAcceptCheck, api.resGetMessages, (req, res) => {
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

app.post('/api/v1/messages', api.reqContentCheck, jsonParser, api.reqBodyObjectCheck, (req, res, next) => {
  api.reqBodyPropertyCheck('user', req, res, next);
}, (req, res, next) => {
  api.reqBodyPropertyCheck('text', req, res, next);
}, (req, res, next) => {
  api.resGetUserByName(req.body.user, req, res, next);
}, (req, res, next) => {
  db.createMessage(res.locals.user._id, req.body.text, (err2, msgRes) => {
    if (err2) {
      api.customError(500, res.locals.methodsString, next);
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
}, api.reqCheckMethods, (req, res, next) => {
  api.resGetMessageByRefId(req.params.ref_id, req, res, next);
});

app.head('/api/v1/messages/:ref_id', api.genericHEAD);

app.options('/api/v1/messages/:ref_id', api.genericOPTIONS);

app.delete('/api/v1/messages/:ref_id', (req, res, next) => {
  db.deleteMessage(res.locals.message._id, (err) => {
    if (err) {
      api.customError(500, res.locals.methodsString, next);
    } else {
      res.status(204)
      .end();
    }
  });
});

app.get('/api/v1/messages/:ref_id', api.reqAcceptCheck, (req, res, next) => {
  db.getUserById(res.locals.message.user_id, (err2, userRes) => {
    if (err2) {
      api.customError(500, res.locals.methodsString, next);
    } else {
      res.locals.user = userRes;
      next();
    }
  });
}, api.resGetLogs, (req, res) => {
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

app.put('/api/v1/messages/:ref_id', api.reqContentCheck, jsonParser, api.reqBodyObjectCheck, (req, res, next) => {
  if ('user' in req.body) {
    db.getUserByName(req.body.user, (err1, userRes) => {
      if (err1) {
        api.customError(404, res.locals.methodsString, next, `${req.body.user} isn't an existing user.`);
      } else {
        db.updateMessageUser(res.locals.message._id, userRes._id, (err2) => {
          if (err2) {
            api.customError(500, res.locals.methodsString, next);
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
        api.customError(500, res.locals.methodsString, next);
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
}, api.reqCheckMethods);

app.head('/api/v1/logs', api.genericHEAD);

app.options('/api/v1/logs', api.genericOPTIONS);

app.get('/api/v1/logs', api.reqAcceptCheck, api.resGetLogs, (req, res) => {
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

app.post('/api/v1/logs', api.reqContentCheck, jsonParser, api.reqBodyObjectCheck, (req, res, next) => {
  api.reqBodyPropertyCheck('name', req, res, next);
}, (req, res, next) => {
  api.reqBodyPropertyCheck('users', req, res, next);
}, (req, res, next) => {
  api.reqBodyPropertyCheck('messages', req, res, next);
}, (req, res, next) => {
  if (!(Array.isArray(req.body.users))) {
    api.customError(400, res.locals.methodsString, next, 'The "users" property in your POST request body should be a JSON array.');
  } else if (!(Array.isArray(req.body.messages))) {
    api.customError(400, res.locals.methodsString, next, 'The "messages" property in your POST request body should be a JSON array.');
  } else {
    next();
  }
}, (req, res, next) => {
  api.resGetMessageByRefId(req.body.messages, req, res, next);
}, (req, res, next) => {
  api.resGetUserByName(req.body.users, req, res, next);
}, (req, res, next) => {
  const dbUsers = res.locals.user.map((user) => {
    return user._id;
  });
  const dbMsgs = res.locals.message.map((message) => {
    return message._id;
  });
  db.createLog(dbUsers, dbMsgs, req.body.name, (err, logRes) => {
    if (err) {
      api.customError(500, res.locals.methodsString, next);
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
}, api.reqCheckMethods, (req, res, next) => {
  api.resGetLogByName(req.params.name, req, res, next);
});

app.head('/api/v1/logs/:name', api.genericHEAD);

app.options('/api/v1/logs/:name', api.genericOPTIONS);

app.delete('/api/v1/logs/:name', (req, res, next) => {
  db.deleteLog(res.locals.log._id, (err) => {
    if (err) {
      api.customError(500, res.locals.methodsString, next);
    } else {
      res.status(204)
      .end();
    }
  });
});

app.get('/api/v1/logs/:name', api.reqAcceptCheck, api.resGetUsers, api.resGetMessages, (req, res) => {
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

app.put('/api/v1/logs/:name', api.reqContentCheck, jsonParser, api.reqBodyObjectCheck, (req, res, next) => {
  if ('users' in req.body) {
    if (Array.isArray(req.body.users)) {
      db.getUserByName(req.body.users, (err1, userRes) => {
        if (err1) {
          api.customError(400, res.locals.methodsString, next, 'Invalid user names in PUT request body.');
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
              api.customError(500, res.locals.methodsString, next);
            } else {
              next();
            }
          });
        }
      });
    } else {
      api.customError(400, res.locals.methodsString, next, 'The "users" property in your PUT request body should be a JSON array.');
    }
  } else {
    next();
  }
}, (req, res, next) => {
  if ('messages' in req.body) {
    if (Array.isArray(req.body.messages)) {
      db.getMessageByRefId(req.body.messages, (err1, msgRes) => {
        if (err1) {
          api.customError(400, res.locals.methodsString, next, 'Invalid message refIds in PUT request body.');
        } else {
          let msgIds;
          if (Array.isArray(msgRes)) {
            msgIds = msgRes.map((message) => {
              return message._id;
            });
          } else {
            msgIds = [msgRes];
          }
          db.updateLogMessages(res.locals.log._id, msgIds, (err2) => {
            if (err2) {
              api.customError(500, res.locals.methodsString, next);
            } else {
              next();
            }
          });
        }
      });
    } else {
      api.customError(400, res.locals.methodsString, next, 'The "messages" property in your PUT request body should be a JSON array.');
    }
  } else {
    next();
  }
}, (req, res, next) => {
  if ('name' in req.body) {
    db.updateLogName(res.locals.log._id, req.body.name, (err) => {
      if (err) {
        api.customError(500, res.locals.methodsString, next);
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
