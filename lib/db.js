'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;
exports.disconnect = disconnect;
exports.drop = drop;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.getUserByName = getUserByName;
exports.createUser = createUser;
exports.updateUserName = updateUserName;
exports.deleteUser = deleteUser;
exports.getMessages = getMessages;
exports.createMessage = createMessage;
exports.getMessageById = getMessageById;
exports.getMessageByRefId = getMessageByRefId;
exports.updateMessageText = updateMessageText;
exports.updateMessageUser = updateMessageUser;
exports.deleteMessage = deleteMessage;
exports.createLog = createLog;
exports.getLogs = getLogs;
exports.getLogById = getLogById;
exports.getLogByName = getLogByName;
exports.updateLogName = updateLogName;
exports.updateLogUsers = updateLogUsers;
exports.updateLogMessages = updateLogMessages;
exports.deleteLog = deleteLog;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _models = require('./models.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env node */

function connect(dbName) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  _mongoose2.default.connect(dbName, function (err) {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    }
  });
}

function disconnect() {
  var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  _mongoose2.default.connection.close(function (err) {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    }
  });
}

function drop() {
  var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  _mongoose2.default.connection.db.dropDatabase(function (err) {
    if (callback) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    }
  });
}

function getUsers() {
  var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  /* eslint-disable array-callback-return */
  _models.User.find(function (err, users) {
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

function getUserById(userId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  _models.User.findById(userId, function (err, user) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, user);
      }
    }
  });
}

function getUserByName(name) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var query = {};
  if (Array.isArray(name)) {
    query.name = { $in: name };
  } else {
    query.name = name;
  }
  _models.User.find(query, function (err, user) {
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

function createUser(name) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  getUsers(function (err1, res) {
    var filteredUsers = res.filter(function (user) {
      if (user.name === name) {
        return user;
      }
      return false;
    });
    if (filteredUsers.length === 0) {
      var newUser = new _models.User({
        name: name,
        created_at: new Date()
      });
      newUser.save(function (err2, resUser) {
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

function updateUserName(userId, newName) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var query = { _id: userId };
  var newData = { name: newName };
  _models.User.update(query, newData, {}, function (err, res) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

function deleteUser(userId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  getUserById(userId, function (err1) {
    if (err1 & callback) {
      callback(err1);
    } else {
      _models.User.remove({ _id: userId }, function (err2) {
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

function getMessages() {
  var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  /* eslint-disable array-callback-return */
  _models.Message.find(function (err, messages) {
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

function createMessage(userId, text) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  getMessages(function (err1, res) {
    var refId = void 0;
    if (res.length === 0) {
      refId = 1;
    } else {
      refId = res[res.length - 1].ref_id + 1;
    }
    var newMessage = new _models.Message({
      user_id: userId,
      ref_id: refId,
      text: text,
      created_at: new Date()
    });
    newMessage.save(function (err2, resMessage) {
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

function getMessageById(messageId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  _models.Message.findById(messageId, function (err, message) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, message);
      }
    }
  });
}

function getMessageByRefId(refId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var query = {};
  if (Array.isArray(refId)) {
    query.ref_id = { $in: refId };
  } else {
    query.ref_id = refId;
  }
  _models.Message.find(query, function (err, message) {
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

function updateMessageText(messageId, newText) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var query = { _id: messageId };
  var newData = { text: newText };
  _models.Message.update(query, newData, {}, function (err, res) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

function updateMessageUser(messageId, newUser) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var query = { _id: messageId };
  var newData = { user_id: newUser };
  _models.Message.update(query, newData, {}, function (err, res) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

function deleteMessage(messageId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  getMessageById(messageId, function (err1) {
    if (err1 & callback) {
      callback(err1);
    } else {
      _models.Message.remove({ _id: messageId }, function (err2) {
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

function createLog(userIds, messageIds, name) {
  var callback = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

  var newLog = new _models.Log({
    user_ids: userIds,
    message_ids: messageIds,
    name: name,
    created_at: new Date()
  });
  newLog.save(function (err, resLog) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, resLog);
      }
    }
  });
}

function getLogs() {
  var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  /* eslint-disable array-callback-return */
  _models.Log.find(function (err, logs) {
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

function getLogById(logId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  _models.Log.findById(logId, function (err, log) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, log);
      }
    }
  });
}

function getLogByName(name) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var query = {};
  if (Array.isArray(name)) {
    query.name = { $in: name };
  } else {
    query.name = name;
  }
  _models.Log.find(query, function (err, log) {
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

function updateLogName(logId, newName) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var query = { _id: logId };
  var newData = { name: newName };
  _models.Log.update(query, newData, {}, function (err, res) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

function updateLogUsers(logId, newUsers) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var query = { _id: logId };
  var newData = { user_ids: newUsers };
  _models.Log.update(query, newData, {}, function (err, res) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

function updateLogMessages(logId, newMessages) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var query = { _id: logId };
  var newData = { message_ids: newMessages };
  _models.Log.update(query, newData, {}, function (err, res) {
    if (callback) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    }
  });
}

function deleteLog(logId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  getLogById(logId, function (err1) {
    if (err1 & callback) {
      callback(err1);
    } else {
      _models.Log.remove({ _id: logId }, function (err2) {
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