/* eslint-env node */

import express from 'express';

const app = express();
	
app.get('/', function (req, res) {
  res.send('init.');
});

app.listen(5000);