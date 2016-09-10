/* eslint-env node */

import app from './api.js';
import * as db from './db.js';

if (process.env.NODE_ENV === 'development') {
  db.connect('mongodb://localhost/fieldingchat');
  app.listen(5000);
} else if (process.env.NODE_ENV === 'production') {
  db.connect(process.env.MONGODB_URI);
  app.listen(process.env.PORT);
}
