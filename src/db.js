/* eslint-env node */

import mongoose from 'mongoose';
import {
  User,
  Message,
  Log,
} from './models.js';

/** 
  * Wrapper functions for Mongoose MongoDB queries, specific to this API.
  * @module db
*/

/** 
  * Connects to database 'dbName'. 
  * Runs callback with an error if connection fails.
*/
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

/** 
  * Disconnects from existing MongoDB connection. 
  * Runs callback with an error if disconnect fails.
*/
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
/** 
  * Drops all documents from currently connected database.
  * If drop fails, runs callback with an error.
*/
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

/** 
  * Gets all User documents from database.
  * If it fails to get them, runs callback with an error.
*/
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

/** 
  * Gets a User from the database with the input '_id' property.
  * If it fails to get the User, runs callback with an error.
*/
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

/** 
  * Get a User from the database with the input 'name' property.
  * If it fails to get the User, runs callback with an error.
  * If there is more than one User with that name (shouldn't be based on
  * createUser() functionality), puts an array of Users in the callback.
*/
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

/** 
  * Creates a new User in the database with the input 'name' property.
  * First checks to make sure no other Users with that name exist using getUsers().
  * If it fails to create the new User, runs callback with an error.
  * If the User is created, returns the user in the callback.
*/
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

/** 
  * Updates the 'name' property of the User with the input '_id'.
  * First checks to make sure the User exists.
  * Then checks to make sure the 'name' property isn't already taken by another user.
  * If it fails to update the User, or the User doesn't exist, runs callback with an error.
  * If the User is updated, returns a Mongoose response object.
*/
export function updateUserName(userId, newName, callback = null) {
  getUserById(userId, (err1, userRes) => {
    if (err1 && callback) {
      callback(err1);
    } else if (userRes.name === newName) {
      callback(null, null);
    } else {
      getUsers((err2, usersRes) => {
        const filteredUsers = usersRes.filter((user) => {
          if (user.name === newName) {
            return user;
          }
          return false;
        });
        if (filteredUsers.length === 0) {
          User.update({ _id: userRes._id }, { name: newName }, {}, (err3, res) => {
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
export function removeUserFromLog(logId, userId, callback = null) {
  getUserById(userId, (err1, userRes) => {
    if (err1 && callback) {
      callback(err1);
    } else {
      getLogById(logId, (err2, logRes) => {
        if (err2 && callback) {
          callback(err2);
        } else {
          Log.update({ _id: logRes._id }, { $pull: { user_ids: userRes._id } }, (err3) => {
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
export function removeUserFromAllLogs(userId, callback = null) {
  getUserById(userId, (err1, userRes) => {
    if (err1 && callback) {
      callback(err1);
    } else {
      Log.update({ }, { $pull: { user_ids: userRes._id } }, { multi: true }, (err2) => {
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
export function deleteUserMessages(userId, callback = null) {
  getUserById(userId, (err1, userRes) => {
    if (err1 && callback) {
      callback(err1);
    } else {
      Message.remove({ user_id: userRes._id }, (err2) => {
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
export function deleteUser(userId, callback = null) {
  getUserById(userId, (err1, userRes) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      removeMessageFromAllLogs(userRes.message_ids, (err2) => {
        if (callback && err2) {
          callback(err2);
        } else {
          deleteUserMessages(userRes._id, (err3) => {
            if (callback && err3) {
              callback(err3);
            } else {
              removeUserFromAllLogs(userRes._id, (err4) => {
                if (callback && err4) {
                  callback(err4);
                } else {
                  User.remove({ _id: userRes._id }, (err5) => {
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

/** 
  * Gets a Message from the database with the input '_id' property.
  * If it fails to get the Message, runs callback with an error.
*/
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

/** 
  * Get a Message from the database with the input 'ref_id' property.
  * If it fails to get the Message, runs callback with an error.
*/
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

/** 
  * Creates a new Message in the database with the input 'user_id' and 'name' properties.
  * First creates a new 'ref_id' but incrementing the one most recently added to the database.
  * If it fails to create the new Message, runs callback with an error.
  * If the Message is created, returns the Message in the callback.
*/
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

/** 
  * Updates the 'text' property of the Message with the input '_id'.
  * First checks to make sure the Message exists.
  * If it fails to update the Message, or the Message doesn't exist, runs callback with an error.
  * If the Message is updated, returns a Mongoose response object.
*/
export function updateMessageText(msgId, newText, callback = null) {
  getMessageById(msgId, (err1, msgRes) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      Message.update({ _id: msgRes._id }, { text: newText }, {}, (err2, res) => {
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
export function updateMessageUser(msgId, userId, callback = null) {
  getMessageById(msgId, (err1, msgRes) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      getUserById(userId, (err2, userRes) => {
        if (err2 & callback) {
          callback(err2);
        } else {
          Message.update({ _id: msgRes._id }, { user_id: userRes._id }, {}, (err3, res) => {
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
export function removeMessageFromLog(logId, msgId, callback = null) {
  getMessageById(msgId, (err1, msgRes) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      getLogById(logId, (err2, logRes) => {
        if (err2 & callback) {
          callback(err2);
        } else {
          Log.update({ _id: logRes._id }, { $pull: { message_ids: msgRes._id } }, (err) => {
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
export function removeMessageFromAllLogs(msgId, callback = null) {
  if (Array.isArray(msgId)) {
    Log.update({ }, { $pullAll: { message_ids: msgId } }, { multi: true }, (err) => {
      if (callback & err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  } else {
    Log.update({ }, { $pull: { message_ids: msgId } }, { multi: true }, (err) => {
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
export function deleteMessage(msgId, callback = null) {
  getMessageById(msgId, (err1, msgRes) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      removeMessageFromAllLogs(msgRes._id, (err2) => {
        if (err2 && callback) {
          callback(err2);
        } else {
          Message.remove({ _id: msgRes._id }, (err3) => {
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
export function createLog(userIds, messageIds, name, callback = null) {
  getLogs((err1, res) => {
    const filteredLogs = res.filter((log) => {
      if (log.name === name) {
        return log;
      }
      return false;
    });
    if (filteredLogs.length === 0) {
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
    } else if (callback) {
      callback(null, filteredLogs[0]);
    }
  });
}

/** 
  * Gets all Log documents from database.
  * If it fails to get them, runs callback with an error.
*/
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

/** 
  * Gets a Log from the database with the input '_id' property.
  * If it fails to get the Log, runs callback with an error.
*/
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

/** 
  * Get a Log from the database with the input 'name' property.
  * If it fails to get the Message, runs callback with an error.
  * If there is more than one Log with that name (shouldn't be based on
  * createLog() functionality), puts an array of Logs in the callback.
*/
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

/** 
  * Updates the 'name' property of the Log with the input '_id'.
  * First checks to make sure the Log exists.
  * Then checks to make sure an existing Log doesn't have the same 'name' property.
  * If it fails to update the Log, or the Log doesn't exist, runs callback with an error.
  * If the Log is updated, returns a Mongoose response object.
*/
export function updateLogName(logId, newName, callback = null) {
  getLogById(logId, (err1, logRes) => {
    if (err1 & callback) {
      callback(err1);
    } else if (logRes.name === newName) {
      callback(null, null);
    } else {
      getLogs((err2, logsRes) => {
        const filteredLogs = logsRes.filter((log) => {
          if (log.name === newName) {
            return log;
          }
          return false;
        });
        if (filteredLogs.length === 0) {
          Log.update({ _id: logRes._id }, { name: newName }, {}, (err3, res) => {
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
export function updateLogUsers(logId, newUsers, callback = null) {
  getLogById(logId, (err1, logRes) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      Log.update({ _id: logRes._id }, { user_ids: newUsers }, {}, (err2, res) => {
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
export function updateLogMessages(logId, newMessages, callback = null) {
  getLogById(logId, (err1, logRes) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      Log.update({ _id: logRes._id }, { message_ids: newMessages }, {}, (err2, res) => {
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
export function deleteLog(logId, callback = null) {
  getLogById(logId, (err1, logRes) => {
    if (err1 & callback) {
      callback(err1);
    } else {
      Log.remove({ _id: logRes._id }, (err2) => {
        if (err2 && callback) {
          callback(err2);
        } else {
          callback(null);
        }
      });
    }
  });
}
