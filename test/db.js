import 'babel-polyfill';
import chai from 'chai';
import * as db from '../src/db.js';

const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);
const should = chai.should();

describe('mongo', () => {
  describe('general', () => {
    describe('connect()', () => {
      it('should open a connection to the Mongo database', (done) => {
        db.connect('mongodb://localhost/fielding_chat_test', (err) => {
          should.not.exist(err);
          done();
        });
        db.disconnect();
      });
    });

    describe('disconnect()', () => {
      it('should close the connection to the Mongo database', (done) => {
        db.connect('mongodb://localhost/fielding_chat_test');
        db.disconnect((err) => {
          should.not.exist(err);
          done();
        });
      });
    });
  });

  describe('models', () => {
    before('start database', (done) => {
      db.connect('mongodb://localhost/fielding_chat_test', () => {
        done();
      });
    });

    after('close database', (done) => {
      db.disconnect(() => {
        done();
      });
    });

    afterEach('drop database', (done) => {
      db.drop(() => {
        done();
      });
    });

    describe('getUsers()', () => {
      it('should get a list of users and pass them to the callback', (done) => {
        db.createUser('user1', () => {
          db.createUser('user2', () => {
            db.getUsers((err, usersRes) => {
              should.not.exist(err);
              usersRes.should.be.a('array');
              usersRes[0].name.should.equal('user1');
              usersRes[1].name.should.equal('user2');
              done();
            });
          });
        });
      });
    });

    describe('getUserById()', () => {
      it('should get the user with the input id and pass it to the callback', (done) => {
        db.createUser('user1', (err1, userRes1) => {
          db.getUserById(userRes1._id, (err2, userRes2) => {
            should.not.exist(err2);
            userRes2._id.toString().should.equal(userRes1._id.toString());
            done();
          });
        });
      });

      it('should pass an error to the callback if the user does not exist', (done) => {
        db.getUserById('12345', (err, res) => {
          should.exist(err);
          should.not.exist(res);
          done();
        });
      });
    });

    describe('getUserByName()', () => {
      it('should get the user with the input name and pass it to the callback', (done) => {
        db.createUser('user1', (err1, userRes1) => {
          db.getUserByName(userRes1.name, (err2, userRes2) => {
            should.not.exist(err2);
            userRes2._id.toString().should.equal(userRes1._id.toString());
            done();
          });
        });
      });

      it('if passed an array, should get multiple users with the input names and pass them to the callback', (done) => {
        db.createUser('user1', (err1, userRes1) => {
          db.createUser('user2', (err2, userRes2) => {
            db.getUserByName([userRes1.name, userRes2.name], (err3, userRes3) => {
              should.not.exist(err3);
              userRes3[0]._id.toString().should.equal(userRes1._id.toString());
              userRes3[1]._id.toString().should.equal(userRes2._id.toString());
              done();
            });
          });
        });
      });

      it('should pass an error to the callback if the user does not exist', (done) => {
        db.getUserByName('user1', (err, res) => {
          should.exist(err);
          should.not.exist(res);
          done();
        });
      });
    });

    describe('createUser()', () => {
      it('should add a new user to the database', (done) => {
        db.createUser('user1', (err, res) => {
          should.not.exist(err);
          res.should.have.property('name');
          res.name.should.equal('user1');
          res.should.have.property('created_at');
          done();
        });
      });

      it('should only add a user if the name is not taken', (done) => {
        db.createUser('user1', (err1, res1) => {
          db.createUser('user1', (err2, res2) => {
            should.not.exist(err2);
            res2._id.toString().should.equal(res1._id.toString());
            done();
          });
        });
      });
    });

    describe('updateUserName()', () => {
      it('should update input User document with the input name', (done) => {
        db.createUser('user1', (err1, userRes1) => {
          db.updateUserName(userRes1._id, 'user2', (err2, res) => {
            should.not.exist(err2);
            res.nModified.should.equal(1);
            db.getUserById(userRes1._id, (err3, userRes2) => {
              userRes2.name.should.equal('user2');
              done();
            });
          });
        });
      });
    });

     describe('removeUserFromLog()', () => {
      it('should update input Log document by removing the input User from user_ids', (done) => {
        db.createUser('user2', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.removeUserFromLog(logRes1._id, userRes._id, (err4) => {
                should.not.exist(err4);
                db.getLogById(logRes1._id, (err5, logRes2) => {
                  logRes2.user_ids.length.should.equal(0);
                  done();
                });
              });
            });
          });
        });
      });
    });

    describe('removeUserFromAllLogs()', () => {
      it('should update input Log documents by removing the input User from user_ids', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.createLog([userRes._id], [msgRes._id], 'log2', (err3, logRes2) => {
                db.removeUserFromAllLogs(userRes._id, (err4) => {
                  should.not.exist(err4);
                  db.getLogs((err5, logsRes) => {
                    logsRes[0].user_ids.length.should.equal(0);
                    logsRes[1].user_ids.length.should.equal(0);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    describe('deleteUserMessages()', () => {
      it('should delete messages associated with the input user', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes1) => {
            db.createMessage(userRes._id, 'tex2', (err2, msgRes2) => {
              db.deleteUserMessages(userRes._id, (err4) => {
                should.not.exist(err4);
                db.getMessages((err5, msgsRes) => {
                  msgsRes.length.should.equal(0);
                  done();
                });
              });
            });
          });
        });
      });
    });

    describe('deleteUser()', () => {
      it('should delete the user with the input id', (done) => {
        db.createUser('user1', (err, userRes) => {
          db.deleteUser(userRes._id, (err2) => {
            should.not.exist(err2);
            db.getUsers((err3, usersRes) => {
              usersRes.length.should.equal(0);
              done();
            });
          });
        });
      });

      it('should delete messages associated with the user and remove the user from any logs that contain it', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.deleteUser(userRes._id, (err4) => {
                should.not.exist(err4);
                db.getLogById(logRes1._id, (err5, logRes2) => {
                  logRes2.user_ids.length.should.equal(0);
                  db.getMessages((err6, msgsRes) => {
                    msgsRes.length.should.equal(0);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    describe('getMessages()', () => {
      it('should get a list of messages and pass them to the callback', (done) => {
        db.createUser('user1', (err1, userRes1) => {
          db.createMessage(userRes1._id, 'text1', () => {
            db.createMessage(userRes1._id, 'text2', () => {
              db.getMessages((err2, msgsRes) => {
                should.not.exist(err2);
                msgsRes.should.be.a('array');
                msgsRes[0].text.should.equal('text1');
                msgsRes[1].text.should.equal('text2');
                done();
              });
            });
          });
        });
      });
    });

    describe('getMessageById()', () => {
      it('should get the message with the input id and pass it to the callback', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes1) => {
            db.getMessageById(msgRes1._id, (err3, msgRes2) => {
              should.not.exist(err3);
              msgRes2._id.toString().should.equal(msgRes1._id.toString());
              done();
            });
          });
        });
      });

      it('should pass an error to the callback if the message does not exist', (done) => {
        db.getMessageById('12345', (err, res) => {
          should.exist(err);
          should.not.exist(res);
          done();
        });
      });
    });

    describe('getMessageByRefId()', () => {
      it('should get the message with the input refId and pass it to the callback', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes1) => {
            db.getMessageByRefId(msgRes1.ref_id, (err3, msgRes2) => {
              should.not.exist(err3);
              msgRes2._id.toString().should.equal(msgRes1._id.toString());
              done();
            });
          });
        });
      });

      it('if passed an array, should get multiple messages with the input refIds and pass it to the callback', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes1) => {
            db.createMessage(userRes._id, 'text2', (err3, msgRes2) => {
              db.getMessageByRefId([msgRes1.ref_id, msgRes2.ref_id], (err4, msgRes3) => {
                should.not.exist(err4);
                msgRes3[0]._id.toString().should.equal(msgRes1._id.toString());
                msgRes3[1]._id.toString().should.equal(msgRes2._id.toString());
                done();
              });
            });
          });
        });
      });

      it('should pass an error to the callback if the message does not exist', (done) => {
        db.getMessageByRefId('1', (err, res) => {
          should.exist(err);
          should.not.exist(res);
          done();
        });
      });
    });

    describe('createMessage()', () => {
      it('should add a new Message to the database', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            should.not.exist(err2);
            msgRes.should.have.property('ref_id');
            msgRes.ref_id.should.equal(1);
            msgRes.should.have.property('user_id');
            msgRes.user_id.should.equal(userRes._id);
            msgRes.should.have.property('text');
            msgRes.text.should.equal('text1');
            done();
          });
        });
      });

      it('should increment the ref_id of the new Message from the previous Message', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', () => {
            db.createMessage(userRes._id, 'text1', (err3, msgRes) => {
              should.not.exist(err3);
              msgRes.ref_id.should.equal(2);
              done();
            });
          });
        });
      });
    });

    describe('updateMessageText()', () => {
      it('should update input Message document with the input text', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes1) => {
            db.updateMessageText(msgRes1._id, 'text2', (err3, res) => {
              should.not.exist(err3);
              res.nModified.should.equal(1);
              db.getMessageById(msgRes1._id, (err4, msgRes2) => {
                msgRes2.text.should.equal('text2');
                done();
              });
            });
          });
        });
      });
    });

    describe('updateMessageUser()', () => {
      it('should update input Message document with the input user', (done) => {
        db.createUser('user1', (err1, userRes1) => {
          db.createMessage(userRes1._id, 'text1', (err2, msgRes1) => {
            db.createUser('user2', (err3, userRes2) => {
              db.updateMessageUser(msgRes1._id, userRes2._id, (err4, res) => {
                should.not.exist(err4);
                res.nModified.should.equal(1);
                db.getMessageById(msgRes1._id, (err5, msgRes2) => {
                  msgRes2.user_id.toString().should.equal(userRes2._id.toString());
                  done();
                });
              });
            });
          });
        });
      });
    });

    describe('removeMessageFromLog()', () => {
      it('should update input Log document by removing the input Message from message_ids', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.removeMessageFromLog(logRes1._id, msgRes._id, (err4) => {
                should.not.exist(err4);
                db.getLogById(logRes1._id, (err5, logRes2) => {
                  logRes2.message_ids.length.should.equal(0);
                  done();
                });
              });
            });
          });
        });
      });
    });

    describe('removeMessageFromAllLogs()', () => {
      it('should update input Log documents by removing the input Message from message_ids', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.createLog([userRes._id], [msgRes._id], 'log2', (err3, logRes2) => {
                db.removeMessageFromAllLogs(msgRes._id, (err4) => {
                  should.not.exist(err4);
                  db.getLogs((err5, logsRes) => {
                    logsRes[0].message_ids.length.should.equal(0);
                    logsRes[1].message_ids.length.should.equal(0);
                    done();
                  });
                });
              });
            });
          });
        });
      });

      it('should update input Log documents by removing the input Messages (array) from message_ids', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes1) => {
            db.createMessage(userRes._id, 'text2', (err2, msgRes2) => {
              db.createMessage(userRes._id, 'text3', (err3, msgRes3) => {
                db.createLog([userRes._id], [msgRes1._id], 'log1', (err4, logRes1) => {
                  db.createLog([userRes._id], [msgRes2._id, msgRes3._id], 'log2', (err5, logRes2) => {
                    db.removeMessageFromAllLogs([msgRes1._id, msgRes2._id, msgRes3._id], (err5) => {
                      should.not.exist(err5);
                      db.getLogs((err6, logsRes) => {
                        logsRes[0].message_ids.length.should.equal(0);
                        logsRes[1].message_ids.length.should.equal(0);
                        done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    describe('deleteMessage()', () => {
      it('should delete the message with the input id', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.deleteMessage(msgRes._id, (err3) => {
              should.not.exist(err3);
              db.getMessages((err4, msgsRes) => {
                msgsRes.length.should.equal(0);
                done();
              });
            });
          });
        });
      });
      it('should remove the message from any logs that contain it', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.deleteMessage(msgRes._id, (err4) => {
                should.not.exist(err4);
                db.getLogById(logRes1._id, (err5, logRes2) => {
                  logRes2.message_ids.length.should.equal(0);
                  done();
                });
              });
            });
          });
        });
      });
    });

    describe('getLogs()', () => {
      it('should get a list of logs and pass them to the callback', (done) => {
        db.createUser('user1', (err1, userRes1) => {
          db.createUser('user2', (err2, userRes2) => {
            db.createMessage(userRes1._id, 'text1', (err3, msgRes1) => {
              db.createMessage(userRes2._id, 'text2', (err4, msgRes2) => {
                db.createLog([userRes1._id], [msgRes1._id], 'log1', () => {
                  db.createLog([userRes2._id], [msgRes2._id], 'log2', () => {
                    db.getLogs((err5, logsRes) => {
                      should.not.exist(err5);
                      logsRes.should.be.a('array');
                      logsRes[0].user_ids[0].toString().should.equal(userRes1._id.toString());
                      logsRes[0].message_ids[0].toString().should.equal(msgRes1._id.toString());
                      logsRes[0].name.should.equal('log1');
                      logsRes[1].user_ids[0].toString().should.equal(userRes2._id.toString());
                      logsRes[1].message_ids[0].toString().should.equal(msgRes2._id.toString());
                      logsRes[1].name.should.equal('log2');
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    describe('getLogById()', () => {
      it('should get the log with the input id and pass it to the callback', (done) => {
        db.createUser('user2', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1 ', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.getLogById(logRes1._id, (err4, logRes2) => {
                should.not.exist(err4);
                logRes2._id.toString().should.equal(logRes1._id.toString());
                done();
              });
            });
          });
        });
      });

      it('should pass an error to the callback if the log does not exist', (done) => {
        db.getLogById('12345', (err, res) => {
          should.exist(err);
          should.not.exist(res);
          done();
        });
      });
    });

    describe('getLogByName()', () => {
      it('should get the log with the input name and pass it to the callback', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.getLogByName(logRes1.name, (err4, logRes2) => {
                should.not.exist(err4);
                logRes2._id.toString().should.equal(logRes1._id.toString());
                done();
              });
            });
          });
        });
      });

      it('if passed an array, should get multiple logs with the input names and pass them to the callback', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.createLog([userRes._id], [msgRes._id], 'log2', (err4, logRes2) => {
                db.getLogByName([logRes1.name, logRes2.name], (err5, logRes3) => {
                  should.not.exist(err5);
                  logRes3[0]._id.toString().should.equal(logRes1._id.toString());
                  logRes3[1]._id.toString().should.equal(logRes2._id.toString());
                  done();
                });
              });
            });
          });
        });
      });

      it('should pass an error to the callback if the log does not exist', (done) => {
        db.getLogByName('log1', (err, res) => {
          should.exist(err);
          should.not.exist(res);
          done();
        });
      });
    });

    describe('createLog()', () => {
      it('should add a new log to the database', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes) => {
              should.not.exist(err3);
              logRes.should.have.property('user_ids');
              logRes.user_ids[0].should.equal(userRes._id);
              logRes.should.have.property('message_ids');
              logRes.message_ids[0].should.equal(msgRes._id);
              logRes.should.have.property('name');
              logRes.name.should.equal('log1');
              done();
            });
          });
        });
      });
    });

    describe('updateLogName()', () => {
      it('should update input Log document with the input name', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes1) => {
              db.updateLogName(logRes1._id, 'log2', (err4, res) => {
                should.not.exist(err4);
                res.nModified.should.equal(1);
                db.getLogById(logRes1._id, (err5, logRes2) => {
                  logRes2.name.should.equal('log2');
                  done();
                });
              });
            });
          });
        });
      });
    });

    describe('updateLogUsers()', () => {
      it('should update input Log document with the input users', (done) => {
        db.createUser('user1', (err1, userRes1) => {
          db.createUser('user2', (err2, userRes2) => {
            db.createUser('user3', (err3, userRes3) => {
              db.createMessage(userRes1._id, 'text1', (err4, msgRes) => {
                db.createLog([userRes1._id, userRes2._id], [msgRes._id], 'log1', (err5, logRes1) => {
                  db.updateLogUsers(logRes1._id, [userRes2._id, userRes3._id], (err6, res) => {
                    should.not.exist(err6);
                    res.nModified.should.equal(1);
                    db.getLogById(logRes1._id, (err7, logRes2) => {
                      logRes2.user_ids[0].toString().should.equal(userRes2._id.toString());
                      logRes2.user_ids[1].toString().should.equal(userRes3._id.toString());
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    describe('updateLogMessages()', () => {
      it('should update input Log document with the input messages', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes1) => {
            db.createMessage(userRes._id, 'text2', (err3, msgRes2) => {
              db.createLog([userRes._id], [msgRes1._id], 'log1', (err4, logRes1) => {
                db.updateLogMessages(logRes1._id, [msgRes2._id], (err5, res) => {
                  should.not.exist(err5);
                  res.nModified.should.equal(1);
                  db.getLogById(logRes1._id, (err6, logRes2) => {
                    logRes2.message_ids[0].toString().should.equal(msgRes2._id.toString());
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    describe('deleteLog()', () => {
      it('should delete the log with the input id', (done) => {
        db.createUser('user1', (err1, userRes) => {
          db.createMessage(userRes._id, 'text1', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'log1', (err3, logRes) => {
              db.deleteLog(logRes._id, (err4) => {
                should.not.exist(err4);
                db.getLogs((err, logsRes) => {
                  logsRes.length.should.equal(0);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});
