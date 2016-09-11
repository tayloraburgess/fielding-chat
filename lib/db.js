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

/** 
  * Wrapper functions for Mongoose MongoDB queries, specific to this API.
  * @module api
*/

/** 
  * Connects to database 'dbName'. 
  * Runs callback with an error if connection fails.
*/
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

/** 
  * Disconnects from existing MongoDB connection. 
  * Runs callback with an error if disconnect fails.
*/
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
/** 
  * Drops all documents from currently connected database.
  * If drop fails, runs callback with an error.
*/
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

/** 
  * Gets all User documents from database.
  * If it fails to get them, runs callback with an error.
*/
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

/** 
  * Gets a User from the database with the input '_id' property.
  * If it fails to get the User, runs callback with an error.
*/
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

/** 
  * Get a User from the database with the input 'name' property.
  * If it fails to get the User, runs callback with an error.
  * If there is more than one User with that name (shouldn't be based on
  * createUser() functionality), puts an array of Users in the callback.
*/
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

/** 
  * Creates a new User in the database with the input 'name' property.
  * First checks to make sure no other Users with that name exist using getUsers().
  * If it fails to create the new User, runs callback with an error.
  * If the User is created, returns the user in the callback.
*/
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

/** 
  * Updates the 'name' property of the User with the input '_id'.
  * First checks to make sure the User exists.
  * Then checks to make sure the 'name' property isn't already taken by another user.
  * If it fails to update the User, or the User doesn't exist, runs callback with an error.
  * If the User is updated, returns a Mongoose response object.
*/
function updateUserName(userId, newName) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  getUserById(userId, function (err1, userRes) {
    if (err1 && callback) {
      callback(err1);
    } else if (userRes.name === newName) {
      callback(null, null);
    } else {
      getUsers(function (err2, usersRes) {
        var filteredUsers = usersRes.filter(function (user) {
          if (user.name === newName) {
            return user;
          }
          return false;
        });
        if (filteredUsers.length === 0) {
          _models.User.update({ _id: userRes._id }, { name: newName }, {}, function (err3, res) {
            if (callback) {
              if (err3) {
                callback(err3, null);
              } else {
                callback(null, res);
              }
            }
          });
        } else {
          callback(new Error(), null);
        }
      });
    }
  });
}

/** 
  * Removes the user with the input '_id' property from the Log with input '_id'.
  * First checks to make sure the User exists.
  * Then checks to make sure the Log exists.
  * If the Log or the User doesn't exist, runs callback with an error.
*/
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

/** 
  * Removes the User with the input '_id' property from all Logs.
  * First checks to make sure the User exists.
  * Then pulls all Users with the input '_id' from all 'user_ids' Log properties in the database.
  * If User doesn't exist, or the update fails, runs callback with an error.
*/
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

/** 
  * Deletes all Messages associated with the user with the input '_id' property.
  * First checks to make sure the User exists.
  * Then deletes all messages with the input User '_id' in their 'user_id' property.
  * If User doesn't exist, or the update fails, runs callback with an error.
*/
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

/** 
  * Deletes a User with the input '_id' property.
  * First checks to make sure the User exists.
  * Then deletes all messages associated with the User, and removes the User from all Logs containing it.
  * If User doesn't exist, or any stage of removal fails, runs callback with an error.
*/
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

/** 
  * Gets all Message documents from database.
  * If it fails to get them, runs callback with an error.
*/
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

/** 
  * Gets a Message from the database with the input '_id' property.
  * If it fails to get the Message, runs callback with an error.
*/
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

/** 
  * Get a Message from the database with the input 'ref_id' property.
  * If it fails to get the Message, runs callback with an error.
*/
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

/** 
  * Creates a new Message in the database with the input 'user_id' and 'name' properties.
  * First creates a new 'ref_id' but incrementing the one most recently added to the database.
  * If it fails to create the new Message, runs callback with an error.
  * If the Message is created, returns the Message in the callback.
*/
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

/** 
  * Updates the 'text' property of the Message with the input '_id'.
  * First checks to make sure the Message exists.
  * If it fails to update the Message, or the Message doesn't exist, runs callback with an error.
  * If the Message is updated, returns a Mongoose response object.
*/
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

/** 
  * Updates the 'user_id' property of the Message with the input '_id'.
  * First checks to make sure the Message exists.
  * Then checks to make sure the input User exists.
  * If it fails to update the Message, or the Message or User doesn't exist, runs callback with an error.
  * If the Message is updated, returns a Mongoose response object.
*/
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

/** 
  * Removes the Message with the input '_id' property from the Log with input '_id'.
  * First checks to make sure the Message exists.
  * Then checks to make sure the Log exists.
  * If the Log or the Message doesn't exist, runs callback with an error.
*/
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

/** 
  * Removes the Message (or Messages) with the input '_id' (or '_id's) property from all Logs.
  * Pulls the message/messages with the input '_id'(s) from all 'message_ids' Log properties in the database.
  * If the update fails, runs callback with an error.
*/
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

/** 
  * Deletes a Message with the input '_id' property.
  * First checks to make sure the Message exists.
  * Then removes the Message from all Logs associated with it.
  * If Message doesn't exist, or any stage of removal fails, runs callback with an error.
*/
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

/** 
  * Creates a new Log in the database with the input 'user_ids' and 'message_ids' properties.
  * If it fails to create the new Log, runs callback with an error.
  * If a Log of the same input name already exists, it puts the existing Log in the callback.
  * If the Log is created, returns the Log in the callback.
*/
function createLog(userIds, messageIds, name) {
  var callback = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

  getLogs(function (err1, res) {
    var filteredLogs = res.filter(function (log) {
      if (log.name === name) {
        return log;
      }
      return false;
    });
    if (filteredLogs.length === 0) {
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
    } else if (callback) {
      callback(null, filteredLogs[0]);
    }
  });
}

/** 
  * Gets all Log documents from database.
  * If it fails to get them, runs callback with an error.
*/
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

/** 
  * Gets a Log from the database with the input '_id' property.
  * If it fails to get the Log, runs callback with an error.
*/
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

/** 
  * Get a Log from the database with the input 'name' property.
  * If it fails to get the Message, runs callback with an error.
  * If there is more than one Log with that name (shouldn't be based on
  * createLog() functionality), puts an array of Logs in the callback.
*/
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

/** 
  * Updates the 'name' property of the Log with the input '_id'.
  * First checks to make sure the Log exists.
  * Then checks to make sure an existing Log doesn't have the same 'name' property.
  * If it fails to update the Log, or the Log doesn't exist, runs callback with an error.
  * If the Log is updated, returns a Mongoose response object.
*/
function updateLogName(logId, newName) {
  var callback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  getLogById(logId, function (err1, logRes) {
    if (err1 & callback) {
      callback(err1);
    } else if (logRes.name === newName) {
      callback(null, null);
    } else {
      getLogs(function (err2, logsRes) {
        var filteredLogs = logsRes.filter(function (log) {
          if (log.name === newName) {
            return log;
          }
          return false;
        });
        if (filteredLogs.length === 0) {
          _models.Log.update({ _id: logRes._id }, { name: newName }, {}, function (err3, res) {
            if (callback) {
              if (err3) {
                callback(err3, null);
              } else {
                callback(null, res);
              }
            }
          });
        } else {
          callback(new Error(), null);
        }
      });
    }
  });
}

/** 
  * Updates the 'user_ids' property of the Log with the input '_id'.
  * First checks to make sure the Log exists.
  * If it fails to update the Log, or the Log doesn't exist, runs callback with an error.
  * If the Log is updated, returns a Mongoose response object.
*/
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

/** 
  * Updates the 'message_ids' property of the Log with the input '_id'.
  * First checks to make sure the Log exists.
  * If it fails to update the Log, or the Log doesn't exist, runs callback with an error.
  * If the Log is updated, returns a Mongoose response object.
*/
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

/** 
  * Deletes a Log with the input '_id' property.
  * First checks to make sure the Log exists.
  * If Log doesn't exist, or the removal fails, runs callback with an error.
*/
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