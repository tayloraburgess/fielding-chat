/* eslint-env node */

import 'babel-polyfill';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as db from '../src/db.js';

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

function postMediaCheck(req, res, next) {
  if (req.is('application/hal+json') || req.is('application/json') || req.is('json')) {
    next();
  } else {
    customError(415, res.locals.methodsString, next);
  }
}

app.all('/api/v1', (req, res, next) => {
  res.locals.methods = ['GET'];
  res.locals.methodsString = res.locals.methods.join(', ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} /api/v1. Try ${res.locals.methodsString} instead.`);
  }
});

app.get('/api/v1', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
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
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.all('/api/v1/users', (req, res, next) => {
  res.locals.methods = ['GET', 'POST'];
  res.locals.methodsString = res.locals.methods.join(', ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} /api/v1/users. Try ${res.locals.methodsString} instead.`);
  }
});

app.get('/api/v1/users', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getUsers((err, users) => {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        const items = users.map((user) => {
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
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.post('/api/v1/users', postMediaCheck, jsonParser, (req, res, next) => {
  if (req.body instanceof Object) {
    if (!('name' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/users is missing a "name" key/value pair in the body.');
    } else {
      db.createUser(req.body.name, (err, userRes) => {
        if (err) {
          customError(500, res.locals.methodsString, next);
        } else {
          res.status(201)
          .location(`/api/v1/users/${userRes.name}`)
          .end();
        }
      });
    }
  } else {
    customError(415, res.locals.methodsString, next);
  }
});

app.all('/api/v1/users/:name', (req, res, next) => {
  res.locals.methods = ['GET', 'PUT', 'DELETE'];
  res.locals.methodsString = res.locals.methods.join(', ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} /api/v1/users/${req.params.name}. Try ${res.locals.methodsString} instead.`);
  }
});

app.get('/api/v1/users/:name', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getUserByName(req.params.name, (err, user) => {
      if (err) {
        customError(404, res.locals.methodsString, next, `${req.params.name} isn't an existing log.`);
      } else {
        db.getMessages((err2, messages) => {
          if (err2) {
            customError(500, res.locals.methodsString, next);
          } else {
            const messageItems = messages.filter((message) => {
              if (message.user_id.toString() === user._id.toString()) {
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
              name: user.name,
              createdAt: user.created_at,
            });
          }
        });
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.all('/api/v1/messages', (req, res, next) => {
  res.locals.methods = ['GET', 'POST'];
  res.locals.methodsString = res.locals.methods.join(', ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} /api/v1/messages. Try ${res.locals.methodsString} instead.`);
  }
});

app.get('/api/v1/messages', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getMessages((err, messages) => {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        const items = messages.map((message) => {
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
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.post('/api/v1/messages', postMediaCheck, jsonParser, (req, res, next) => {
  if (req.body instanceof Object) {
    if (!('user' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/messsages is missing a "user" key/value pair in the body.');
    } else {
      db.getUserByName(req.body.user, (err1, userRes) => {
        if (err1) {
          customError(400, res.locals.methodsString, next, `${req.body.user} is not an existing user.`);
        } else if (!('text' in req.body)) {
          customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/messsages is missing a "text" key/value pair in the body.');
        } else {
          db.createMessage(userRes._id, req.body.text, (err2, msgRes) => {
            if (err2) {
              customError(500, res.locals.methodsString, next);
            } else {
              res.status(201)
              .location(`/api/v1/messages/${msgRes.ref_id}`)
              .end();
            }
          });
        }
      });
    }
  } else {
    customError(415, res.locals.methodsString, next);
  }
});

app.all('/api/v1/messages/:ref_id', (req, res, next) => {
  res.locals.methods = ['GET', 'PUT', 'DELETE'];
  res.locals.methodsString = res.locals.methods.join(', ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} /api/v1/messages/${req.params.ref_id}. Try ${res.locals.methodsString} instead.`);
  }
});

app.get('/api/v1/messages/:ref_id', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getMessageByRefId(req.params.ref_id, (err, message) => {
      if (err) {
        customError(404, res.locals.methodsString, next, `${req.params.ref_id} isn't an existing log.`);
      } else {
        db.getUserById(message.user_id, (err2, userRes) => {
          if (err2) {
            customError(500, res.locals.methodsString, next);
          } else {
            db.getLogs((err3, logsRes) => {
              if (err3) {
                customError(500, res.locals.methodsString, next);
              } else {
                const logItems = logsRes.filter((log) => {
                  const strMsgIds = log.message_ids.map((id) => {
                    return id.toString();
                  });
                  if (strMsgIds.indexOf(message._id.toString()) > -1) {
                    return log;
                  }
                  return false;
                }).map((log) => {
                  return { href: `/api/v1/logs/${log.name}` };
                });
                logItems.unshift({ href: 'api/v1/messages' });
                res.status(200)
                .set({
                  'Content-Type': 'application/hal+json',
                  Allow: res.locals.methodsString,
                })
                .json({
                  _links: {
                    self: { href: `/api/v1/messages/${req.params.ref_id}` },
                    collection: logItems,
                    related: { href: `/api/v1/users/${userRes.name}` },
                  },
                  user: userRes.name,
                  text: message.text,
                  createdAt: message.created_at,
                });
              }
            });
          }
        });
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.all('/api/v1/logs', (req, res, next) => {
  res.locals.methods = ['GET', 'POST'];
  res.locals.methodsString = res.locals.methods.join(', ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} /api/v1/logs. Try ${res.locals.methodsString} instead.`);
  }
});

app.get('/api/v1/logs', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getLogs((err, logs) => {
      if (err) {
        customError(500, res.locals.methodsString, next);
      } else {
        const items = logs.map((log) => {
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
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
});

app.post('/api/v1/logs', postMediaCheck, jsonParser, (req, res, next) => {
  if (req.body instanceof Object) {
    if (!('name' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/logs is missing a "name" key/value pair in the body.');
    } else if (!('users' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/messsages is missing a "text" key/value pair in the body.');
    } else if (!(Array.isArray(req.body.users))) {
      customError(400, res.locals.methodsString, next, 'The "users" field in your POST request body should be a JSON array.');
    } else if (!('messages' in req.body)) {
      customError(400, res.locals.methodsString, next, 'Your POST request to /api/v1/messsages is missing a "messages" key/value pair in the body.');
    } else if (!(Array.isArray(req.body.messages))) {
      customError(400, res.locals.methodsString, next, 'The "messages" field in your POST request body should be a JSON array.');
    } else {
      db.getUserByName(req.body.users, (err1, usersRes) => {
        if (err1) {
          customError(400, res.locals.methodsString, next, 'Invalid user names in POST request body.');
        } else {
          db.getMessageByRefId(req.body.messages, (err2, msgsRes) => {
            if (err2) {
              customError(400, res.locals.methodsString, next, 'Invalid user refIds in POST request body.');
            } else {
              const dbUsers = usersRes.map((user) => {
                return user._id;
              });
              const dbMsgs = msgsRes.map((message) => {
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
            }
          });
        }
      });
    }
  } else {
    customError(415, res.locals.methodsString, next);
  }
});

app.all('/api/v1/logs/:name', (req, res, next) => {
  res.locals.methods = ['GET', 'PUT', 'DELETE'];
  res.locals.methodsString = res.locals.methods.join(', ');
  if (res.locals.methods.indexOf(req.method) > -1) {
    next();
  } else {
    customError(405, res.locals.methodsString, next, `You cannot ${req.method} /api/v1/logs/${req.params.ref_id}. Try ${res.locals.methodsString} instead.`);
  }
});

app.get('/api/v1/logs/:name', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getLogByName(req.params.name, (err, log) => {
      if (err) {
        customError(404, res.locals.methodsString, next, `${req.params.name} isn't an existing log.`);
      } else {
        db.getUsers((err2, usersRes) => {
          if (err2) {
            customError(500, res.locals.methodsString, next);
          } else {
            db.getMessages((err3, msgsRes) => {
              if (err3) {
                customError(500, res.locals.methodsString, next);
              } else {
                const strMsgIds = log.message_ids.map((id) => {
                  return id.toString();
                });
                const strUserIds = log.user_ids.map((id) => {
                  return id.toString();
                });
                const msgItems = msgsRes.filter((message) => {
                  if (strMsgIds.indexOf(message._id.toString()) > -1) {
                    return message;
                  }
                  return false;
                }).map((message) => {
                  return message.ref_id.toString();
                });
                const userItems = usersRes.filter((user) => {
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
                  name: log.name,
                  users: userItems,
                  messages: msgItems,
                  createdAt: log.created_at,
                });
              }
            });
          }
        });
      }
    });
  } else {
    customError(406, res.locals.methodsString, next);
  }
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
