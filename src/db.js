/* eslint-env node */

import mongoose from 'mongoose';
import {
  User,
  Message,
  Log,
} from './models.js';

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
        callback(null);
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

export function getUserByName(name, callback = null) {
  const query = {};
  if (Array.isArray(name)) {
    query.name = { $in: name };
  } else {
    query.name = name;
  }
  User.find(query, (err, user) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else if (user.length === 1) {
        callback(null, user[0]);
      } else if (user.length > 1) {
        callback(null, user);
      } else {
        callback(new Error(), null);
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

export function createMessage(userId, text, callback = null) {
  getMessages((err1, res) => {
    let refId;
    if (res.length === 0) {
      refId = 1;
    } else {
      refId = res[res.length - 1].ref_id + 1;
    }
    const newMessage = new Message({
      user_id: userId,
      ref_id: refId,
      text,
      created_at: new Date(),
    });
    newMessage.save((err2, resMessage) => {
      if (callback) {
        if (err2) {
          callback(err2, null);
        } else {
          callback(null, resMessage);
        }
      }
    });
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

export function getMessageByRefId(refId, callback = null) {
  const query = {};
  if (Array.isArray(refId)) {
    query.ref_id = { $in: refId };
  } else {
    query.ref_id = refId;
  }
  Message.find(query, (err, message) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else if (message.length === 1) {
        callback(null, message[0]);
      } else if (message.length > 1) {
        callback(null, message);
      } else {
        callback(new Error(), null);
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

export function getLogByName(name, callback = null) {
  const query = {};
  if (Array.isArray(name)) {
    query.name = { $in: name };
  } else {
    query.name = name;
  }
  Log.find(query, (err, log) => {
    if (callback) {
      if (err) {
        callback(err, null);
      } else if (log.length === 1) {
        callback(null, log[0]);
      } else if (log.length > 1) {
        callback(null, log);
      } else {
        callback(new Error(), null);
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

export function updateLogUsers(logId, newUsers, callback = null) {
  const query = { _id: logId };
  const newData = { user_ids: newUsers };
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

export function updateLogMessages(logId, newMessages, callback = null) {
  const query = { _id: logId };
  const newData = { message_ids: newMessages };
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
