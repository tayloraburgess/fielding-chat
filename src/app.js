/* eslint-env node */

import 'babel-polyfill';
import express from 'express';

const app = express();

app.get('/api/v1', (req, res) => {
  if (req.accepts(['application/hal+json', 'application/json', 'json'])) {
    res.status(200)
    .type('application/hal+json')
    .json({
      _links: {
        self: { href: '/api/v1' },
      },
    });
  } else {
    res.status(406)
    .end();
  }
});

app.listen(5000);

export default app;
