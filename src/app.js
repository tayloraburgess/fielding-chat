/* eslint-env node */

import 'babel-polyfill';
import express from 'express';
import * as db from '../src/db.js';

function customError(status, methods, next, body) {
  let throwErr;
  if (status === 406) {
    throwErr = new Error('Invalid hypermedia type. Try Accept: "application/hal+json" instead.');
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

const app = express();
db.connect('mongodb://localhost/fieldingchat');

app.all('/api/v1', (req, res, next) => {
  if (req.method === 'GET') {
    next();
  } else {
    customError(405, 'GET', next, `You cannot ${req.method} /api/v1. Try GET instead.`);
  }
});
app.get('/api/v1', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    res.status(200)
    .set({
      'Content-Type': 'application/hal+json',
      Allow: 'GET',
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
    customError(406, 'GET', next);
  }
});

app.all('/api/v1/users', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') {
    next();
  } else {
    customError(405, 'GET, POST', next, `You cannot ${req.method} /api/v1/users. Try GET or POST instead.`);
  }
});
app.get('/api/v1/users', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getUsers((err, users) => {
      if (err) {
        customError(500, 'GET, POST', next);
      } else {
        const items = users.map((user) => {
          return { href: `/api/v1/users/${user.name}` };
        });
        res.status(200)
        .set({
          'Content-Type': 'application/hal+json',
          Allow: 'GET, POST',
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
    customError(406, 'GET, POST', next);
  }
});

app.all('/api/v1/users/:name', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE') {
    next();
  } else {
    customError(405, 'GET, PUT, DELETE', next, `You cannot ${req.method} /api/v1/users/${req.params.name}. Try GET, PUT, or DELETE instead.`);
  }
});
app.get('/api/v1/users/:name', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getUserByName(req.params.name, (err, user) => {
      if (err) {
        customError(404, 'GET, PUT, DELETE', next, `${req.params.name} isn't an existing log.`);
      } else {
        db.getMessages((err2, messages) => {
          if (err2) {
            customError(500, 'GET, PUT, DELETE', next);
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
              Allow: 'GET, PUT, DELETE',
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
    customError(406, 'GET, PUT DELETE', next);
  }
});

app.all('/api/v1/messages', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') {
    next();
  } else {
    customError(405, 'GET, POST', next, `You cannot ${req.method} /api/v1/messages. Try GET or POST instead.`);
  }
});
app.get('/api/v1/messages', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getMessages((err, messages) => {
      if (err) {
        customError(500, 'GET, POST', next);
      } else {
        const items = messages.map((message) => {
          return { href: `/api/v1/messages/${message.ref_id}` };
        });
        res.status(200)
        .set({
          'Content-Type': 'application/hal+json',
          Allow: 'GET, POST',
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
    customError(406, 'GET, POST', next);
  }
});

app.all('/api/v1/messages/:ref_id', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE') {
    next();
  } else {
    customError(405, 'GET, PUT, DELETE', next, `You cannot ${req.method} /api/v1/messages/${req.params.ref_id}. Try GET, PUT, or DELETE instead.`);
  }
});
app.get('/api/v1/messages/:ref_id', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getMessageByRefId(req.params.ref_id, (err, message) => {
      if (err) {
        customError(404, 'GET, PUT DELETE', next, `${req.params.ref_id} isn't an existing log.`);
      } else {
        db.getUserById(message.user_id, (err2, userRes) => {
          if (err2) {
            customError(500, 'GET, PUT, DELETE', next);
          } else {
            db.getLogs((err3, logsRes) => {
              if (err3) {
                customError(500, 'GET, PUT, DELETE', next);
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
                  Allow: 'GET, PUT, DELETE',
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
    customError(406, 'GET, PUT DELETE', next);
  }
});

app.all('/api/v1/logs', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') {
    next();
  } else {
    customError(405, 'GET, POST', next, `You cannot ${req.method} /api/v1/logs. Try GET or POST instead.`);
  }
});
app.get('/api/v1/logs', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getLogs((err, logs) => {
      if (err) {
        customError(500, 'GET, POST', next);
      } else {
        const items = logs.map((log) => {
          return { href: `/api/v1/logs/${log.name}` };
        });
        res.status(200)
        .set({
          'Content-Type': 'application/hal+json',
          Allow: 'GET, POST',
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
    customError(406, 'GET, POST', next);
  }
});

app.all('/api/v1/logs/:name', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE') {
    next();
  } else {
    customError(405, 'GET, PUT, DELETE', next, `You cannot ${req.method} /api/v1/logs/${req.params.ref_id}. Try GET, PUT, or DELETE instead.`);
  }
});
app.get('/api/v1/logs/:name', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getLogByName(req.params.name, (err, log) => {
      if (err) {
        customError(404, 'GET, PUT DELETE', next, `${req.params.name} isn't an existing log.`);
      } else {
        db.getUsers((err2, usersRes) => {
          if (err2) {
            customError(500, 'GET, PUT, DELETE', next);
          } else {
            db.getMessages((err3, msgsRes) => {
              if (err3) {
                customError(500, 'GET, PUT, DELETE', next);
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
                  Allow: 'GET, POST',
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
    customError(406, 'GET, PUT DELETE', next);
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

app.listen(5000);

export default app;
