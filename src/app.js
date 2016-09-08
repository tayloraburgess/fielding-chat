/* eslint-env node */

import 'babel-polyfill';
import express from 'express';
import * as db from '../src/db.js';

const app = express();
db.connect('mongodb://localhost/fieldingchat');

app.all('/api/v1', (req, res, next) => {
  if (req.method === 'GET') {
    next();
  } else {
    const err = new Error(`You cannot ${req.method} /api/v1. Try GET instead.`);
    err.status = 405;
    err.methods = 'GET'
    next(err);
  }
});
app.get('/api/v1', (req, res) => {
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
    res.status(406)
    .end();
  }
});
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
/* eslint-enable no-unused-vars*/
  res.status(err.status)
  .set({
    Allow: err.methods,
  })
  .send(err.message);
});

app.all('/api/v1/users', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') {
    next();
  } else {
    const err = new Error(`You cannot ${req.method} /api/v1/users. Try GET or POST instead.`);
    err.status = 405;
    next(err);
  }
});
app.get('/api/v1/users', (req, res) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getUsers((err, users) => {
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
    });
  } else {
    res.status(406)
    .end();
  }
});
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
/* eslint-enable no-unused-vars*/
  res.status(err.status)
  .set({
    Allow: 'GET, POST',
  })
  .send(err.message);
});

app.all('/api/v1/users/:name', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE') {
    next();
  } else {
    const err = new Error(`You cannot ${req.method} /api/v1/users/${req.params.name}. Try GET, PUT, or DELETE instead.`);
    err.status = 405;
    next(err);
  }
});
app.get('/api/v1/users/:name', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getUsers((err, users) => {
      const filtUsers = users.filter((user) => {
        if (user.name === req.params.name) {
          return user;
        }
        return false;
      });
      if (filtUsers.length === 0) {
        const err = new Error(`${req.params.name} isn't an existing user name.`);
        err.status = 404;
        next(err);
      } else {
        const user = filtUsers[0];
        db.getMessages((err, messages) => {
          const messageItems = messages.filter((message) => {
            if (message.user_id.toString() === user._id.toString()) {
              return message;
            }
            return false;
          }).map((message) => {
            return { href: `/api/v1/messages/${message.ref_id}`}
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
        });
      }
    });
  } else {
    res.status(406)
    .end();
  }
});
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
/* eslint-enable no-unused-vars*/
  res.status(err.status)
  .set({
    Allow: 'GET, PUT, DELETE',
  })
  .send(err.message);
});

app.all('/api/v1/messages', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') {
    next();
  } else {
    const err = new Error(`You cannot ${req.method} /api/v1/messages. Try GET or POST instead.`);
    err.status = 405;
    next(err);
  }
});
app.get('/api/v1/messages', (req, res) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getMessages((err, messages) => {
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
    });
  } else {
    res.status(406)
    .end();
  }
});
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
/* eslint-enable no-unused-vars*/
  res.status(err.status)
  .set({
    Allow: 'GET, POST',
  })
  .send(err.message);
});

app.all('/api/v1/messages/:ref_id', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE') {
    next();
  } else {
    const err = new Error(`You cannot ${req.method} /api/v1/messages/${req.params.ref_id}. Try GET, PUT, or DELETE instead.`);
    err.status = 405;
    next(err);
  }
});
app.get('/api/v1/messages/:ref_id', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getMessages((err, messages) => {
      const filtMessages = messages.filter((message) => {
        if (message.ref_id.toString() === req.params.ref_id.toString()) {
          return message;
        }
        return false;
      });
      if (filtMessages.length === 0) {
        const err = new Error(`${req.params.ref_id} isn't an existing message.`);
        err.status = 404;
        next(err);
      } else {
        const message = filtMessages[0];
        db.getUserById(message.user_id, (err, userRes) => {
          db.getLogs((err, logsRes) => {
            let logItems = logsRes.filter((log) => {
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
            logItems.unshift( { href: 'api/v1/messages' } );
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
          });
        });
      }
    });
  } else {
    res.status(406)
    .end();
  }
});
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
/* eslint-enable no-unused-vars*/
  res.status(err.status)
  .set({
    Allow: 'GET, PUT, DELETE',
  })
  .send(err.message);
});

app.all('/api/v1/logs', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') {
    next();
  } else {
    const err = new Error(`You cannot ${req.method} /api/v1/logs. Try GET or POST instead.`);
    err.status = 405;
    next(err);
  }
});
app.get('/api/v1/logs', (req, res) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getLogs((err, logs) => {
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
    });
  } else {
    res.status(406)
    .end();
  }
});
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
/* eslint-enable no-unused-vars*/
  res.status(err.status)
  .set({
    Allow: 'GET, POST',
  })
  .send(err.message);
});

app.all('/api/v1/logs/:name', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE') {
    next();
  } else {
    const err = new Error(`You cannot ${req.method} /api/v1/logs/${req.params.ref_id}. Try GET, PUT, or DELETE instead.`);
    err.status = 405;
    next(err);
  }
});
app.get('/api/v1/logs/:name', (req, res, next) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    db.getLogs((err, logs) => {
      const filtLogs = logs.filter((log) => {
        if (log.name === req.params.name) {
          return log;
        }
        return false;
      });
      if (filtLogs.length === 0) {
        const err = new Error(`${req.params.name} isn't an existing log.`);
        err.status = 404;
        next(err);
      } else {
        const log = filtLogs[0];
        db.getUsers((err, usersRes) => {
          db.getMessages((err, msgsRes) => {
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
          });
        });
      }
    });
  } else {
    res.status(406)
    .end();
  }
});
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
/* eslint-enable no-unused-vars*/
  res.status(err.status)
  .set({
    Allow: 'GET, PUT, DELETE'
  })
  .send(err.message);
});

app.listen(5000);

export default app;
