/* eslint-env node */

import 'babel-polyfill';
import express from 'express';
// import * as db from '../src/db.js';

const app = express();

app.all('/api/v1', (req, res, next) => {
  if (req.method === 'GET') {
    next();
  } else {
    const err = new Error(`You cannot ${req.method} /api/v1. Try GET instead.`);
    err.status = 405;
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
        users: { href: '/api/v1/users' },
        messages: { href: '/api/v1/messages' },
        logs: { href: '/api/v1/logs' },
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
    Allow: 'GET',
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
    res.status(200)
    .set({
      'Content-Type': 'application/hal+json',
      Allow: 'GET, POST',
    })
    .json({
      _links: {
        self: { href: '/api/v1/users' },
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
    Allow: 'GET, POST',
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
    res.status(200)
    .set({
      'Content-Type': 'application/hal+json',
      Allow: 'GET, POST',
    })
    .json({
      _links: {
        self: { href: '/api/v1/messages' },
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
    Allow: 'GET, POST',
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
    res.status(200)
    .set({
      'Content-Type': 'application/hal+json',
      Allow: 'GET, POST',
    })
    .json({
      _links: {
        self: { href: '/api/v1/logs' },
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
    Allow: 'GET, POST',
  })
  .send(err.message);
});

app.listen(5000);

export default app;
