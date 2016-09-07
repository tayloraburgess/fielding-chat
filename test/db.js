import 'babel-polyfill';
import chai from 'chai';
import {
  dbConnect,
  dbDisconnect,
  dbDrop,
  dbCreateUser,
  dbGetUsers,
  dbCreateMessage,
  dbGetMessages,
  dbCreateLog,
  dbGetLogs,
} from '../src/db.js';

const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);
const should = chai.should();

describe('mongo', () => {
  describe('helpers', () => {
    describe('dbConnect()', () => {
      it('should open a connection to the Mongo database', (done) => {
        dbConnect('mongodb://localhost/fielding_chat_test', (err) => {
          should.not.exist(err);
          done();
        });
        dbDisconnect();
      });
    });
    describe('dbDisconnect()', () => {
      it('should close the connection to the Mongo database', (done) => {
        dbConnect('mongodb://localhost/fielding_chat_test');
        dbDisconnect((err) => {
          should.not.exist(err);
          done();
        });
      });
    });
  });
  describe('schema', () => {
    before('start database', (done) => {
      dbConnect('mongodb://localhost/fielding_chat_test', () => {
        done();
      });
    });
    after('close database', (done) => {
      dbDisconnect(() => {
        done();
      });
    });
    afterEach('drop database', (done) => {
      dbDrop(() => {
        done();
      });
    });
    describe('dbCreateUser()', () => {
      it('should add a new user to the database', (done) => {
        dbCreateUser('test', (err, res) => {
          should.not.exist(err);
          res.should.have.property('name');
          res.name.should.equal('test');
          res.should.have.property('created_at');
          done();
        });
      });
      it('should only add a user if the name is not taken', (done) => {
        dbCreateUser('test', (err1, res1) => {
          dbCreateUser('test', (err2, res2) => {
            should.not.exist(err2);
            res2._id.toString().should.equal(res1._id.toString());
            done();
          });
        });
      });
    });
    describe('dbGetUsers()', () => {
      it('should get a list of users and pass them to the callback', (done) => {
        dbCreateUser('test1', () => {
          dbCreateUser('test2', () => {
            dbGetUsers((err, usersRes) => {
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
    describe('dbCreateMessage()', () => {
      it('should add a new message to the database', (done) => {
        dbCreateUser('test', (err1, userRes) => {
          dbCreateMessage(userRes._id, 'test message', (err2, msgRes) => {
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
    describe('dbGetMessages()', () => {
      it('should get a list of messages and pass them to the callback', (done) => {
        dbCreateUser('test1', (err1, userRes1) => {
          dbCreateMessage(userRes1._id, 'test 1', () => {
            dbCreateMessage(userRes1._id, 'test 2', () => {
              dbGetMessages((err2, msgsRes) => {
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
    describe('dbCreateLog()', () => {
      it('should add a new log to the database', (done) => {
        dbCreateUser('test', (err1, userRes) => {
          dbCreateMessage(userRes._id, 'foo', (err2, msgRes) => {
            dbCreateLog([userRes._id], [msgRes._id], 'test log', (err3, logRes) => {
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
    describe('dbGetLogs()', () => {
      it('should get a list of logs and pass them to the callback', (done) => {
        dbCreateUser('test1', (err1, userRes1) => {
          dbCreateUser('test2', (err2, userRes2) => {
            dbCreateMessage(userRes1._id, 'test 1', (err3, msgRes1) => {
              dbCreateMessage(userRes2._id, 'test 2', (err4, msgRes2) => {
                dbCreateLog([userRes1._id], [msgRes1._id], 'test log 1', () => {
                  dbCreateLog([userRes2._id], [msgRes2._id], 'test log 2', () => {
                    dbGetLogs((err5, logsRes) => {
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
  });
});
