'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('babel-polyfill');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var bodyParser = _interopRequireWildcard(_bodyParser);

var _db = require('./db.js');

var db = _interopRequireWildcard(_db);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env node */

var app = (0, _express2.default)();
var jsonParser = bodyParser.json();

function customError(status, methods, next, body) {
  var throwErr = void 0;
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

function reqMediaCheck(req, res, next) {
  if (req.is('application/hal+json') || req.is('application/json') || req.is('json')) {
    next();
  } else {
    customError(415, res.locals.methodsString, next);
  }
}

function bodyObjectCheck(req, res, next) {
  if (req.body instanceof Object) {
    next();
  } else {
    customError(415, res.locals.methodsString, next);
  }
}

function genericHEAD(req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    res.status(200).set({
      'Content-Type': 'application/hal+json',
      Allow: res.locals.methodsString
    }).end();
  } else {
    customError(406, res.locals.methodsString, next);
  }
}

function genericOPTIONS(req, res) {
  res.status(200).set({
    Allow: res.locals.methodsString
  }).end();
}

app.all('/api/v1', function (req, res, next) {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET'];
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, 'You cannot ' + req.method + ' /api/v1. Try ' + res.locals.methodsString + ' instead.');
  }
});

app.head('/api/v1', genericHEAD);

app.options('/api/v1', genericOPTIONS);

app.get('/api/v1', function (req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    res.status(200).set({
      'Content-Type': 'application/hal+json',
      Allow: res.locals.methodsString
    }).json({
      _links: {
        self: { href: '/api/v1' },
        related: [{ href: '/api/v1/users' }, { href: '/api/v1/messages' }, { href: '/api/v1/logs' }]
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.all('/api/v1/users', function (req, res, next) {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'POST'];
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, 'You cannot ' + req.method + ' /api/v1/users. Try ' + res.locals.methodsString + ' instead.');
  }
});

app.head('/api/v1/users', genericHEAD);

app.options('/api/v1/users', genericOPTIONS);

app.get('/api/v1/users', function (req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getUsers(function (err, users) {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        var items = users.map(function (user) {
          return { href: '/api/v1/users/' + user.name };
        });
        res.status(200).set({
          'Content-Type': 'application/hal+json',
          Allow: res.locals.methodsString
        }).json({
          _links: {
            self: { href: '/api/v1/users' },
            item: items
          }
        });
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.post('/api/v1/users', reqMediaCheck, jsonParser, function (req, res, next) {
  if (req.body instanceof Object) {
    if (!('name' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/users is missing a "name" key/value pair in the body.');
    } else {
      db.createUser(req.body.name, function (err, userRes) {
        if (err) {
          customError(500, res.locals.methodsString, next);
        } else {
          res.status(201).location('/api/v1/users/' + userRes.name).end();
        }
      });
    }
  } else {
    customError(415, res.locals.methodsString, next);
  }
});

app.all('/api/v1/users/:name', function (req, res, next) {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'PUT', 'DELETE'];
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, 'You cannot ' + req.method + ' /api/v1/users/' + req.params.name + '. Try ' + res.locals.methodsString + ' instead.');
  }
});

app.use('/api/v1/users/:name', function (req, res, next) {
  db.getUserByName(req.params.name, function (err, user) {
    if (err) {
      customError(404, res.locals.methodsString, next, req.params.name + ' isn\'t an existing user.');
    } else {
      res.locals.user = user;
      next();
    }
  });
});

app.head('/api/v1/users/:name', genericHEAD);

app.options('/api/v1/users/:name', genericOPTIONS);

app.delete('/api/v1/users/:name', function (req, res, next) {
  db.deleteUser(res.locals.user._id, function (err) {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.status(204).end();
    }
  });
});

app.get('/api/v1/users/:name', function (req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getMessages(function (err2, messages) {
      if (err2) {
        customError(500, res.locals.methodsString, next);
      } else {
        var messageItems = messages.filter(function (message) {
          if (message.user_id.toString() === res.locals.user._id.toString()) {
            return message;
          }
          return false;
        }).map(function (message) {
          return { href: '/api/v1/messages/' + message.ref_id };
        });
        res.status(200).set({
          'Content-Type': 'application/hal+json',
          Allow: res.locals.methodsString
        }).json({
          _links: {
            self: { href: '/api/v1/users/' + req.params.name },
            collection: { href: '/api/v1/users' },
            related: messageItems
          },
          name: res.locals.user.name,
          createdAt: res.locals.user.created_at
        });
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.use('/api/v1/users/:name', reqMediaCheck, jsonParser, bodyObjectCheck);

app.use('/api/v1/users/:name', function (req, res, next) {
  if ('name' in req.body) {
    db.updateUserName(res.locals.user._id, req.body.name, function (err) {
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
});

app.put('/api/v1/users/:name', function (req, res) {
  res.status(200).location('/api/v1/users/' + res.locals.newUserName).end();
});

app.all('/api/v1/messages', function (req, res, next) {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'POST'];
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, 'You cannot ' + req.method + ' /api/v1/messages. Try ' + res.locals.methodsString + ' instead.');
  }
});

app.head('/api/v1/messages', genericHEAD);

app.options('/api/v1/messages', genericOPTIONS);

app.get('/api/v1/messages', function (req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getMessages(function (err, messages) {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        var items = messages.map(function (message) {
          return { href: '/api/v1/messages/' + message.ref_id };
        });
        res.status(200).set({
          'Content-Type': 'application/hal+json',
          Allow: res.locals.methodsString
        }).json({
          _links: {
            self: { href: '/api/v1/messages' },
            item: items
          }
        });
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.post('/api/v1/messages', reqMediaCheck, jsonParser, function (req, res, next) {
  if (req.body instanceof Object) {
    if (!('user' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/messsages is missing a "user" key/value pair in the body.');
    } else {
      db.getUserByName(req.body.user, function (err1, userRes) {
        if (err1) {
          customError(400, res.locals.methodsString, next, req.body.user + ' is not an existing user.');
        } else if (!('text' in req.body)) {
          customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/messsages is missing a "text" key/value pair in the body.');
        } else {
          db.createMessage(userRes._id, req.body.text, function (err2, msgRes) {
            if (err2) {
              customError(500, res.locals.methodsString, next);
            } else {
              res.status(201).location('/api/v1/messages/' + msgRes.ref_id).end();
            }
          });
        }
      });
    }
  } else {
    customError(415, res.locals.methodsString, next);
  }
});

app.all('/api/v1/messages/:ref_id', function (req, res, next) {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'PUT', 'DELETE'];
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, 'You cannot ' + req.method + ' /api/v1/messages/' + req.params.ref_id + '. Try ' + res.locals.methodsString + ' instead.');
  }
});

app.use('/api/v1/messages/:ref_id', function (req, res, next) {
  db.getMessageByRefId(req.params.ref_id, function (err, message) {
    if (err) {
      customError(404, res.locals.methodsString, next, req.params.ref_id + ' isn\'t an existing message.');
    } else {
      res.locals.message = message;
      next();
    }
  });
});

app.head('/api/v1/messages/:ref_id', genericHEAD);

app.options('/api/v1/messages/:ref_id', genericOPTIONS);

app.delete('/api/v1/messages/:ref_id', function (req, res, next) {
  db.deleteMessage(res.locals.message._id, function (err) {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.status(204).end();
    }
  });
});

app.get('/api/v1/messages/:ref_id', function (req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getUserById(res.locals.message.user_id, function (err2, userRes) {
      if (err2) {
        customError(500, res.locals.methodsString, next);
      } else {
        db.getLogs(function (err3, logsRes) {
          if (err3) {
            customError(500, res.locals.methodsString, next);
          } else {
            var logItems = logsRes.filter(function (log) {
              var strMsgIds = log.message_ids.map(function (id) {
                return id.toString();
              });
              if (strMsgIds.indexOf(res.locals.message._id.toString()) > -1) {
                return log;
              }
              return false;
            }).map(function (log) {
              return { href: '/api/v1/logs/' + log.name };
            });
            logItems.unshift({ href: 'api/v1/messages' });
            res.status(200).set({
              'Content-Type': 'application/hal+json',
              Allow: res.locals.methodsString
            }).json({
              _links: {
                self: { href: '/api/v1/messages/' + req.params.ref_id },
                collection: logItems,
                related: { href: '/api/v1/users/' + userRes.name }
              },
              user: userRes.name,
              text: res.locals.message.text,
              createdAt: res.locals.message.created_at
            });
          }
        });
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.use('/api/v1/messages/:ref_id', reqMediaCheck, jsonParser, bodyObjectCheck);

app.use('/api/v1/messages/:ref_id', function (req, res, next) {
  if ('user' in req.body) {
    db.getUserByName(req.body.user, function (err1, userRes) {
      if (err1) {
        customError(404, res.locals.methodsString, next, req.body.user + ' isn\'t an existing user.');
      } else {
        db.updateMessageUser(res.locals.message._id, userRes._id, function (err2) {
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
});

app.use('/api/v1/messages/:ref_id', function (req, res, next) {
  if ('text' in req.body) {
    db.updateMessageText(res.locals.message._id, req.body.text, function (err) {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

app.put('/api/v1/messages/:ref_id', function (req, res) {
  res.status(200).location('/api/v1/messages/' + res.locals.message.ref_id).end();
});

app.all('/api/v1/logs', function (req, res, next) {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'POST'];
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, 'You cannot ' + req.method + ' /api/v1/logs. Try ' + res.locals.methodsString + ' instead.');
  }
});

app.head('/api/v1/logs', genericHEAD);

app.options('/api/v1/logs', genericOPTIONS);

app.get('/api/v1/logs', function (req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getLogs(function (err, logs) {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        var items = logs.map(function (log) {
          return { href: '/api/v1/logs/' + log.name };
        });
        res.status(200).set({
          'Content-Type': 'application/hal+json',
          Allow: res.locals.methodsString
        }).json({
          _links: {
            self: { href: '/api/v1/logs' },
            item: items
          }
        });
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.post('/api/v1/logs', reqMediaCheck, jsonParser, function (req, res, next) {
  if (req.body instanceof Object) {
    if (!('name' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/logs is missing a "name" key/value pair in the body.');
    } else if (!('users' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/messsages is missing a "text" key/value pair in the body.');
    } else if (!Array.isArray(req.body.users)) {
      customError(400, res.locals.methodsString, next, 'The "users" field in your POST request body should be a JSON array.');
    } else if (!('messages' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/messsages is missing a "messages" key/value pair in the body.');
    } else if (!Array.isArray(req.body.messages)) {
      customError(400, res.locals.methodsString, next, 'The "messages" field in your POST request body should be a JSON array.');
    } else {
      db.getUserByName(req.body.users, function (err1, usersRes) {
        if (err1) {
          customError(400, res.locals.methodsString, next, 'Invalid user names in POST request body.');
        } else {
          db.getMessageByRefId(req.body.messages, function (err2, msgsRes) {
            if (err2) {
              customError(400, res.locals.methodsString, next, 'Invalid user refIds in POST request body.');
            } else {
              var dbUsers = usersRes.map(function (user) {
                return user._id;
              });
              var dbMsgs = msgsRes.map(function (message) {
                return message._id;
              });
              db.createLog(dbUsers, dbMsgs, req.body.name, function (err, logRes) {
                if (err) {
                  customError(500, res.locals.methodsString, next);
                } else {
                  res.status(201).location('/api/v1/logs/' + logRes.name).end();
                }
              });
            }
          });
        }
      });
    }
  } else {
    customError(415, res.locals.methodsString, next);
  }
});

app.all('/api/v1/logs/:name', function (req, res, next) {
  res.locals.methods = ['HEAD', 'OPTIONS', 'GET', 'PUT', 'DELETE'];
  res.locals.methodsString = res.locals.methods.join(' ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, 'You cannot ' + req.method + ' /api/v1/logs/' + req.params.ref_id + '. Try ' + res.locals.methodsString + ' instead.');
  }
});

app.use('/api/v1/logs/:name', function (req, res, next) {
  db.getLogByName(req.params.name, function (err, log) {
    if (err) {
      customError(404, res.locals.methodsString, next, req.params.name + ' isn\'t an existing log.');
    } else {
      res.locals.log = log;
      next();
    }
  });
});

app.head('/api/v1/logs/:name', genericHEAD);

app.options('/api/v1/logs/:name', genericOPTIONS);

app.delete('/api/v1/logs/:name', function (req, res, next) {
  db.deleteLog(res.locals.log._id, function (err) {
    if (err) {
      customError(500, res.locals.methodsString, next);
    } else {
      res.status(204).end();
    }
  });
});

app.get('/api/v1/logs/:name', function (req, res, next) {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getUsers(function (err2, usersRes) {
      if (err2) {
        customError(500, res.locals.methodsString, next);
      } else {
        db.getMessages(function (err3, msgsRes) {
          if (err3) {
            customError(500, res.locals.methodsString, next);
          } else {
            (function () {
              var strMsgIds = res.locals.log.message_ids.map(function (id) {
                return id.toString();
              });
              var strUserIds = res.locals.log.user_ids.map(function (id) {
                return id.toString();
              });
              var msgItems = msgsRes.filter(function (message) {
                if (strMsgIds.indexOf(message._id.toString()) > -1) {
                  return message;
                }
                return false;
              }).map(function (message) {
                return message.ref_id.toString();
              });
              var userItems = usersRes.filter(function (user) {
                if (strUserIds.indexOf(user._id.toString()) > -1) {
                  return user;
                }
                return false;
              }).map(function (user) {
                return user.name;
              });

              var items = userItems.map(function (user) {
                return { href: '/api/v1/users/' + user };
              }).concat(msgItems.map(function (msg) {
                return { href: '/api/v1/messages/' + msg };
              }));

              res.status(200).set({
                'Content-Type': 'application/hal+json',
                Allow: res.locals.methodsString
              }).json({
                _links: {
                  self: { href: '/api/v1/logs/' + req.params.name },
                  collection: { href: 'api/v1/logs' },
                  related: items
                },
                name: res.locals.log.name,
                users: userItems,
                messages: msgItems,
                createdAt: res.locals.log.created_at
              });
            })();
          }
        });
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.use('/api/v1/logs/:name', reqMediaCheck, jsonParser, bodyObjectCheck);

app.use('/api/v1/logs/:name', function (req, res, next) {
  if ('users' in req.body) {
    if (Array.isArray(req.body.users)) {
      db.getUserByName(req.body.users, function (err1, userRes) {
        if (err1) {
          customError(400, res.locals.methodsString, next, 'Invalid user names in PUT request body.');
        } else {
          var userIds = void 0;
          if (Array.isArray(userRes)) {
            userIds = userRes.map(function (user) {
              return user._id;
            });
          } else {
            userIds = [userRes._id];
          }
          db.updateLogUsers(res.locals.log._id, userIds, function (err2) {
            if (err2) {
              customError(500, res.locals.methodsString, next);
            } else {
              next();
            }
          });
        }
      });
    } else {
      customError(400, res.locals.methodsString, next, 'The "users" field in your PUT request body should be a JSON array.');
    }
  } else {
    next();
  }
});

app.use('/api/v1/logs/:name', function (req, res, next) {
  if ('messages' in req.body) {
    if (Array.isArray(req.body.messages)) {
      db.getMessageByRefId(req.body.messages, function (err1, msgRes) {
        if (err1) {
          customError(400, res.locals.methodsString, next, 'Invalid message refIds in PUT request body.');
        } else {
          var msgIds = void 0;
          if (Array.isArray(msgRes)) {
            msgIds = msgRes.map(function (message) {
              return message._id;
            });
          } else {
            msgIds = [msgRes];
          }
          db.updateLogUsers(res.locals.log._id, msgIds, function (err2) {
            if (err2) {
              customError(500, res.locals.methodsString, next);
            } else {
              next();
            }
          });
        }
      });
    } else {
      customError(400, res.locals.methodsString, next, 'The "messages" field in your PUT request body should be a JSON array.');
    }
  } else {
    next();
  }
});

app.use('/api/v1/logs/:name', function (req, res, next) {
  if ('name' in req.body) {
    db.updateLogName(res.locals.log._id, req.body.name, function (err) {
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
});

app.put('/api/v1/logs/:name', function (req, res) {
  res.status(200).location('/api/v1/logs/' + res.locals.newLogName).end();
});

/* eslint-disable no-unused-vars */
app.use(function (err, req, res, next) {
  /* eslint-enable no-unused-vars*/
  if (res.headersSent || !('custom' in err)) {
    next(err);
  } else {
    res.status(err.status).set({
      Allow: err.methods
    }).send(err.message);
  }
});

exports.default = app;