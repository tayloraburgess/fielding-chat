/* eslint-env node */

import mongoose from 'mongoose';
import {
  User,
  Message,
  Log,
} from '../src/models.js';

export function dbConnect(dbName, callback = false) {
  mongoose.connect(dbName, (err) => {
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

export function dbDrop(callback = false) {
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

export function dbCreateUser(name, callback = false) {
  dbGetUsers((res) => {
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
      newUser.save((err, resUser) => {
        if (callback) {
          if (err) {
            callback(err);
          } else {
            callback(resUser);
          }
        }
      });
    } else if (callback) {
      callback(false);
    }
  });
}

export function dbCreateMessage(userId, text, callback = false) {
  const newMessage = new Message({
    user_id: userId,
    text,
    created_at: new Date(),
  });
  newMessage.save((err, resMessage) => {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(resMessage);
      }
    }
  });
}

export function dbGetMessages(callback = false) {
/* eslint-disable array-callback-return */
  Message.find((err, messages) => {
/* eslint-enable array-callback-return */
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(messages);
      }
    }
  });
}

export function dbCreateLog(userIds, messageIds, callback = false) {
  const newLog = new Log({
    user_ids: userIds,
    message_ids: messageIds,
    created_at: new Date(),
  });
  newLog.save((err, resLog) => {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(resLog);
      }
    }
  });
}

export function dbGetLogs(callback = false) {
/* eslint-disable array-callback-return */
  Log.find((err, logs) => {
/* eslint-enable array-callback-return */
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(logs);
      }
    }
  });
}
