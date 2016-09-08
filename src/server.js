/* eslint-env node */

import app from '../src/api.js';
import * as db from '../src/db.js';

db.connect('mongodb://localhost/fieldingchat');
app.listen(5000);
