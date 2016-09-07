/* eslint-env node */

import mongoose from 'mongoose';
import {
  User,
  Message,
  Log,
} from '../src/models.js';

export function connect(dbName, callback = null) {
  mongoose.connect(dbName, (err) => {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    }
  });
}

export function disconnect(callback = null) {
  mongoose.connection.close((err) => {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    }
  });
}

export function drop(callback = null) {
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

export function getUsers(callback = null) {
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

export function getUserById(userId, callback = null) {
  User.findById(userId, (err, user) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, user);
      }
    }
  });
}

export function createUser(name, callback = null) {
  getUsers((err1, res) => {
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

export function updateUserName(userId, newName, callback = null) {
  const query = { _id: userId };
  const newData = { name: newName };
  User.update(query, newData, {}, (err, res) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

export function deleteUser(userId, callback = null) {
  getUserById(userId, (err1) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      User.remove({ _id: userId }, (err2) => {
        if (callback) {
          if (err2) {
            callback(err2);
          } else {
            callback(null);
          }
        }
      });
    }
  });
}

export function createMessage(userId, text, callback = null) {
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

export function getMessages(callback = null) {
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

export function getMessageById(messageId, callback = null) {
  Message.findById(messageId, (err, message) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, message);
      }
    }
  });
}

export function updateMessageText(messageId, newText, callback = null) {
  const query = { _id: messageId };
  const newData = { text: newText };
  Message.update(query, newData, {}, (err, res) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

export function updateMessageUser(messageId, newUser, callback = null) {
  const query = { _id: messageId };
  const newData = { user_id: newUser };
  Message.update(query, newData, {}, (err, res) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

export function deleteMessage(messageId, callback = null) {
  getMessageById(messageId, (err1) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      Message.remove({ _id: messageId }, (err2) => {
        if (callback) {
          if (err2) {
            callback(err2);
          } else {
            callback(null);
          }
        }
      });
    }
  });
}

export function createLog(userIds, messageIds, name, callback = null) {
  const newLog = new Log({
    user_ids: userIds,
    message_ids: messageIds,
    name,
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

export function getLogs(callback = null) {
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

export function getLogById(logId, callback = null) {
  Log.findById(logId, (err, log) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, log);
      }
    }
  });
}

export function updateLogName(logId, newName, callback = null) {
  const query = { _id: logId };
  const newData = { name: newName };
  Log.update(query, newData, {}, (err, res) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

export function addUserToLog(logId, newUser, callback = null) {
  getLogById(logId, (err, logRes) => {
    if (err && callback) {
      callback(err, null);
    } else {
      logRes.user_ids.push(newUser);
      callback(null, logRes);
    }
  });
}

export function addMessageToLog(logId, newMessage, callback = null) {
  getLogById(logId, (err, logRes) => {
    if (err && callback) {
      callback(err, null);
    } else {
      logRes.message_ids.push(newMessage);
      callback(null, logRes);
    }
  });
}

export function removeUserFromLog(logId, userId, callback = null) {
  getLogById(logId, (err, logRes) => {
    if (err && callback) {
      callback(err, null);
    } else {
      logRes.user_ids.pull(userId);
      callback(null, logRes);
    }
  });
}

export function removeMessageFromLog(logId, messageId, callback = null) {
  getLogById(logId, (err, logRes) => {
    if (err && callback) {
      callback(err, null);
    } else {
      logRes.message_ids.pull(messageId);
      callback(null, logRes);
    }
  });
}

export function deleteLog(logId, callback = null) {
  getLogById(logId, (err1) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      Log.remove({ _id: logId }, (err2) => {
        if (callback) {
          if (err2) {
            callback(err2);
          } else {
            callback(null);
          }
        }
      });
    }
  });
}
