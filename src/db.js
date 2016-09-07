/* eslint-env node */

import mongoose from 'mongoose';
import { User } from '../src/models.js';

export function dbConnect(callback = false) {
  mongoose.connect('mongodb://localhost/fieldingchat', (err) => {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(true);
      }
    }
  });
}

export function dbDisconnect(callback = false) {
  mongoose.connection.close((err) => {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(true);
      }
    }
  });
}

export function dbCreateUser(name, callback = false) {
  const newUser = new User({
    name,
    created_at: new Date(),
  });
  newUser.save((err, resUser) => {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(resUser);
      }
    }
  });
}

export function dbGetUsers(callback = false) {
/* eslint-disable array-callback-return */
  User.find((err, users) => {
/* eslint-enable array-callback-return */

    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(users);
      }
    }
  });
}
