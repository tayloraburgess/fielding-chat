import 'babel-polyfill';
import chai from 'chai';
import * as db from '../src/db.js';

const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);
const should = chai.should();

describe('mongo', () => {
  describe('helpers', () => {
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
  describe('schema', () => {
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
    describe('createUser()', () => {
      it('should add a new user to the database', (done) => {
        db.createUser('test', (err, res) => {
          should.not.exist(err);
          res.should.have.property('name');
          res.name.should.equal('test');
          res.should.have.property('created_at');
          done();
        });
      });
      it('should only add a user if the name is not taken', (done) => {
        db.createUser('test', (err1, res1) => {
          db.createUser('test', (err2, res2) => {
            should.not.exist(err2);
            res2._id.toString().should.equal(res1._id.toString());
            done();
          });
        });
      });
    });
    describe('getUsers()', () => {
      it('should get a list of users and pass them to the callback', (done) => {
        db.createUser('test1', () => {
          db.createUser('test2', () => {
            db.getUsers((err, usersRes) => {
              should.not.exist(err);
              usersRes.should.be.a('array');
              usersRes[0].name.should.equal('test1');
              usersRes[1].name.should.equal('test2');
              done();
            });
          });
        });
      });
    });
    describe('getUserById()', () => {
      it('should get the user with the input id and pass it to the callback', (done) => {
        db.createUser('test', (err1, userRes1) => {
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
    describe('updateUserName()', () => {
      it('should update input User document with the input name', (done) => {
        db.createUser('first', (err1, userRes1) => {
          db.updateUserName(userRes1._id, 'second', (err2, res) => {
            should.not.exist(err2);
            res.nModified.should.equal(1);
            db.getUserById(userRes1._id, (err3, userRes2) => {
              userRes2.name.should.equal('second');
              done();
            });
          });
        });
      });
    });
    describe('deleteUser()', () => {
      it('should delete the user with the input id', (done) => {
        db.createUser('test', (err, userRes) => {
          db.deleteUser(userRes._id, (err2) => {
            should.not.exist(err2);
            db.getUsers((err3, usersRes) => {
              usersRes.length.should.equal(0);
              done();
            });
          });
        });
      });
    });
    describe('createMessage()', () => {
      it('should add a new message to the database', (done) => {
        db.createUser('test', (err1, userRes) => {
          db.createMessage(userRes._id, 'test message', (err2, msgRes) => {
            should.not.exist(err2);
            msgRes.should.have.property('user_id');
            msgRes.user_id.should.equal(userRes._id);
            msgRes.should.have.property('text');
            msgRes.text.should.equal('test message');
            done();
          });
        });
      });
    });
    describe('getMessages()', () => {
      it('should get a list of messages and pass them to the callback', (done) => {
        db.createUser('test1', (err1, userRes1) => {
          db.createMessage(userRes1._id, 'test 1', () => {
            db.createMessage(userRes1._id, 'test 2', () => {
              db.getMessages((err2, msgsRes) => {
                should.not.exist(err2);
                msgsRes.should.be.a('array');
                msgsRes[0].text.should.equal('test 1');
                msgsRes[1].text.should.equal('test 2');
                done();
              });
            });
          });
        });
      });
    });
    describe('getMessageById()', () => {
      it('should get the message with the input id and pass it to the callback', (done) => {
        db.createUser('test', (err1, userRes) => {
          db.createMessage(userRes._id, 'test message', (err2, msgRes1) => {
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
    describe('updateMessageText()', () => {
      it('should update input Message document with the input text', (done) => {
        db.createUser('first', (err1, userRes) => {
          db.createMessage(userRes._id, 'test message', (err2, msgRes1) => {
            db.updateMessageText(msgRes1._id, 'message 2', (err3, res) => {
              should.not.exist(err3);
              res.nModified.should.equal(1);
              db.getMessageById(msgRes1._id, (err4, msgRes2) => {
                msgRes2.text.should.equal('message 2');
                done();
              });
            });
          });
        });
      });
    });
    describe('updateMessageUser()', () => {
      it('should update input Message document with the input user', (done) => {
        db.createUser('first', (err1, userRes1) => {
          db.createMessage(userRes1._id, 'test message', (err2, msgRes1) => {
            db.createUser('second', (err3, userRes2) => {
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
    describe('deleteMessage()', () => {
      it('should delete the message with the input id', (done) => {
        db.createUser('test', (err1, userRes) => {
          db.createMessage(userRes._id, 'test message', (err2, msgRes) => {
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
    });
    describe('createLog()', () => {
      it('should add a new log to the database', (done) => {
        db.createUser('test', (err1, userRes) => {
          db.createMessage(userRes._id, 'foo', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'test log', (err3, logRes) => {
              should.not.exist(err3);
              logRes.should.have.property('user_ids');
              logRes.user_ids[0].should.equal(userRes._id);
              logRes.should.have.property('message_ids');
              logRes.message_ids[0].should.equal(msgRes._id);
              logRes.should.have.property('name');
              logRes.name.should.equal('test log');
              done();
            });
          });
        });
      });
    });
    describe('getLogs()', () => {
      it('should get a list of logs and pass them to the callback', (done) => {
        db.createUser('test1', (err1, userRes1) => {
          db.createUser('test2', (err2, userRes2) => {
            db.createMessage(userRes1._id, 'test 1', (err3, msgRes1) => {
              db.createMessage(userRes2._id, 'test 2', (err4, msgRes2) => {
                db.createLog([userRes1._id], [msgRes1._id], 'test log 1', () => {
                  db.createLog([userRes2._id], [msgRes2._id], 'test log 2', () => {
                    db.getLogs((err5, logsRes) => {
                      should.not.exist(err5);
                      logsRes.should.be.a('array');
                      logsRes[0].user_ids[0].toString().should.equal(userRes1._id.toString());
                      logsRes[0].message_ids[0].toString().should.equal(msgRes1._id.toString());
                      logsRes[0].name.should.equal('test log 1');
                      logsRes[1].user_ids[0].toString().should.equal(userRes2._id.toString());
                      logsRes[1].message_ids[0].toString().should.equal(msgRes2._id.toString());
                      logsRes[1].name.should.equal('test log 2');
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
        db.createUser('test', (err1, userRes) => {
          db.createMessage(userRes._id, 'test message', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'test log 1', (err3, logRes1) => {
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
    describe('addUserToLog()', () => {
      it('should update input Log document with a new user in user_ids', (done) => {
        db.createUser('first', (err1, userRes1) => {
          db.createMessage(userRes1._id, 'test message', (err2, msgRes) => {
            db.createLog([userRes1._id], [msgRes._id], 'test log 1', (err3, logRes1) => {
              db.createUser('second', (err4, userRes2) => {
                db.addUserToLog(logRes1, userRes2, (err5, logRes2) => {
                  should.not.exist(err5);
                  logRes2.user_ids[0].toString().should.equal(userRes1._id.toString());
                  logRes2.user_ids[1].toString().should.equal(userRes2._id.toString());
                  done();
                });
              });
            });
          });
        });
      });
    });
    describe('addMessageToLog()', () => {
      it('should update input Log document with a new user in user_ids', (done) => {
        db.createUser('first', (err1, userRes) => {
          db.createMessage(userRes._id, 'test message', (err2, msgRes1) => {
            db.createLog([userRes._id], [msgRes1._id], 'test log 1', (err3, logRes1) => {
              db.createMessage(userRes._id, 'second message', (err4, msgRes2) => {
                db.addMessageToLog(logRes1, msgRes2._id, (err5, logRes2) => {
                  should.not.exist(err5);
                  logRes2.message_ids[0].toString().should.equal(msgRes1._id.toString());
                  logRes2.message_ids[1].toString().should.equal(msgRes2._id.toString());
                  done();
                });
              });
            });
          });
        });
      });
    });
    describe('deleteLog()', () => {
      it('should delete the log with the input id', (done) => {
        db.createUser('test', (err1, userRes) => {
          db.createMessage(userRes._id, 'test message', (err2, msgRes) => {
            db.createLog([userRes._id], [msgRes._id], 'test log 1', (err3, logRes) => {
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
