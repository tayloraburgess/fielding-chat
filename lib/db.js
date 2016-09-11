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
exports.removeUserFromLog = removeUserFromLog;
exports.removeUserFromAllLogs = removeUserFromAllLogs;
exports.deleteUserMessages = deleteUserMessages;
exports.deleteUser = deleteUser;
exports.getMessages = getMessages;
exports.getMessageById = getMessageById;
exports.getMessageByRefId = getMessageByRefId;
exports.createMessage = createMessage;
exports.updateMessageText = updateMessageText;
exports.updateMessageUser = updateMessageUser;
exports.removeMessageFromLog = removeMessageFromLog;
exports.removeMessageFromAllLogs = removeMessageFromAllLogs;
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

  getUserById(userId, function (err1, userRes) {
    if (err1 && callback) {
      callback(err1);
    } else {
      _models.User.update({ _id: userRes._id }, { name: newName }, {}, function (err2, res) {
        if (callback) {
          if (err2) {
            callback(err2, null);
          } else {
            callback(null, res);
          }
        }
      });
    }
  });
}

function removeUserFromLog(logId, userId) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  getUserById(userId, function (err1, userRes) {
    if (err1 && callback) {
      callback(err1);
    } else {
      getLogById(logId, function (err2, logRes) {
        if (err2 && callback) {
          callback(err2);
        } else {
          _models.Log.update({ _id: logRes._id }, { $pull: { user_ids: userRes._id } }, function (err3) {
            if (callback & err3) {
              callback(err3);
            } else {
              callback(null);
            }
          });
        }
      });
    }
  });
}

function removeUserFromAllLogs(userId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  getUserById(userId, function (err1, userRes) {
    if (err1 && callback) {
      callback(err1);
    } else {
      _models.Log.update({}, { $pull: { user_ids: userRes._id } }, { multi: true }, function (err2) {
        if (callback & err2) {
          callback(err2);
        } else {
          callback(null);
        }
      });
    }
  });
}

function deleteUserMessages(userId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  getUserById(userId, function (err1, userRes) {
    if (err1 && callback) {
      callback(err1);
    } else {
      _models.Message.remove({ user_id: userRes._id }, function (err2) {
        if (callback & err2) {
          callback(err2);
        } else {
          callback(null);
        }
      });
    }
  });
}

function deleteUser(userId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  getUserById(userId, function (err1, userRes) {
    if (err1 & callback) {
      callback(err1);
    } else {
      removeMessageFromAllLogs(userRes.message_ids, function (err2) {
        if (callback && err2) {
          callback(err2);
        } else {
          deleteUserMessages(userRes._id, function (err3) {
            if (callback && err3) {
              callback(err3);
            } else {
              removeUserFromAllLogs(userRes._id, function (err4) {
                if (callback && err4) {
                  callback(err4);
                } else {
                  _models.User.remove({ _id: userRes._id }, function (err5) {
                    if (err5 && callback) {
                      callback(err5);
                    } else {
                      callback(null);
                    }
                  });
                }
              });
            }
          });
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

function updateMessageText(msgId, newText) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  getMessageById(msgId, function (err1, msgRes) {
    if (err1 & callback) {
      callback(err1);
    } else {
      _models.Message.update({ _id: msgRes._id }, { text: newText }, {}, function (err2, res) {
        if (callback) {
          if (err2) {
            callback(err2, null);
          } else {
            callback(null, res);
          }
        }
      });
    }
  });
}

function updateMessageUser(msgId, userId) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  getMessageById(msgId, function (err1, msgRes) {
    if (err1 & callback) {
      callback(err1);
    } else {
      getUserById(userId, function (err2, userRes) {
        if (err2 & callback) {
          callback(err2);
        } else {
          _models.Message.update({ _id: msgRes._id }, { user_id: userRes._id }, {}, function (err3, res) {
            if (callback) {
              if (err3) {
                callback(err3, null);
              } else {
                callback(null, res);
              }
            }
          });
        }
      });
    }
  });
}

function removeMessageFromLog(logId, msgId) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  getMessageById(msgId, function (err1, msgRes) {
    if (err1 & callback) {
      callback(err1);
    } else {
      getLogById(logId, function (err2, logRes) {
        if (err2 & callback) {
          callback(err2);
        } else {
          _models.Log.update({ _id: logRes._id }, { $pull: { message_ids: msgRes._id } }, function (err) {
            if (callback & err) {
              callback(err);
            } else {
              callback(null);
            }
          });
        }
      });
    }
  });
}

function removeMessageFromAllLogs(msgId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  if (Array.isArray(msgId)) {
    _models.Log.update({}, { $pullAll: { message_ids: msgId } }, { multi: true }, function (err) {
      if (callback & err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  } else {
    _models.Log.update({}, { $pull: { message_ids: msgId } }, { multi: true }, function (err) {
      if (callback & err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }
}

function deleteMessage(msgId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  getMessageById(msgId, function (err1, msgRes) {
    if (err1 & callback) {
      callback(err1);
    } else {
      removeMessageFromAllLogs(msgRes._id, function (err2) {
        if (err2 && callback) {
          callback(err2);
        } else {
          _models.Message.remove({ _id: msgRes._id }, function (err3) {
            if (callback & err3) {
              callback(err3);
            } else {
              callback(null);
            }
          });
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

  getLogById(logId, function (err1, logRes) {
    if (err1 & callback) {
      callback(err1);
    } else {
      _models.Log.update({ _id: logRes._id }, { name: newName }, {}, function (err2, res) {
        if (callback) {
          if (err2) {
            callback(err2, null);
          } else {
            callback(null, res);
          }
        }
      });
    }
  });
}

function updateLogUsers(logId, newUsers) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  getLogById(logId, function (err1, logRes) {
    if (err1 & callback) {
      callback(err1);
    } else {
      _models.Log.update({ _id: logRes._id }, { user_ids: newUsers }, {}, function (err2, res) {
        if (callback) {
          if (err2) {
            callback(err2, null);
          } else {
            callback(null, res);
          }
        }
      });
    }
  });
}

function updateLogMessages(logId, newMessages) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  getLogById(logId, function (err1, logRes) {
    if (err1 & callback) {
      callback(err1);
    } else {
      _models.Log.update({ _id: logRes._id }, { message_ids: newMessages }, {}, function (err2, res) {
        if (callback) {
          if (err2) {
            callback(err2, null);
          } else {
            callback(null, res);
          }
        }
      });
    }
  });
}

function deleteLog(logId) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  getLogById(logId, function (err1, logRes) {
    if (err1 & callback) {
      callback(err1);
    } else {
      _models.Log.remove({ _id: logRes._id }, function (err2) {
        if (err2 && callback) {
          callback(err2);
        } else {
          callback(null);
        }
      });
    }
  });
}