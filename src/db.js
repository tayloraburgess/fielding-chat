/* eslint-env node */

import mongoose from 'mongoose';
import {
  User,
  Message,
  Log,
} from '../src/models.js';

export function dbConnect(dbName, callback = null) {
  const conn = mongoose.connect(dbName, (err) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, conn);
      }
    }
  });
}

export function dbDisconnect(callback = null) {
  const conn = mongoose.connection.close((err) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, conn);
      }
    }
  });
}

export function dbDrop(callback = null) {
  mongoose.connection.db.dropDatabase((err) => {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(true);
      }
    }
  });
}

export function dbGetUsers(callback = null) {
/* eslint-disable array-callback-return */
  User.find((err, users) => {
/* eslint-enable array-callback-return */
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, users);
      }
    }
  });
}

export function dbCreateUser(name, callback = null) {
  dbGetUsers((err1, res) => {
    const filteredUsers = res.filter((user) => {
      if (user.name === name) {
        return user;
      }
      return false;
    });
    if (filteredUsers.length === 0) {
      const newUser = new User({
        name,
        created_at: new Date(),
      });
      newUser.save((err2, resUser) => {
        if (callback) {
          if (err2) {
            callback(err2, null);
          } else {
            callback(null, resUser);
          }
        }
      });
    } else if (callback) {
      callback(null, filteredUsers[0]);
    }
  });
}

export function dbCreateMessage(userId, text, callback = null) {
  const newMessage = new Message({
    user_id: userId,
    text,
    created_at: new Date(),
  });
  newMessage.save((err, resMessage) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, resMessage);
      }
    }
  });
}

export function dbGetMessages(callback = null) {
/* eslint-disable array-callback-return */
  Message.find((err, messages) => {
/* eslint-enable array-callback-return */
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, messages);
      }
    }
  });
}

export function dbCreateLog(userIds, messageIds, callback = null) {
  const newLog = new Log({
    user_ids: userIds,
    message_ids: messageIds,
    created_at: new Date(),
  });
  newLog.save((err, resLog) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, resLog);
      }
    }
  });
}

export function dbGetLogs(callback = null) {
/* eslint-disable array-callback-return */
  Log.find((err, logs) => {
/* eslint-enable array-callback-return */
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, logs);
      }
    }
  });
}
