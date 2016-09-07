import 'babel-polyfill';
import chai from 'chai';
import {
  dbConnect,
  dbDisconnect,
  dbDrop,
  dbCreateUser,
  dbGetUsers,
  dbCreateMessage,
  dbCreateLog,
} from '../src/db.js';

const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);
chai.should();

describe('Mongo', () => {
  describe('helpers', () => {
    describe('dbConnect()', () => {
      it('should open a connection to the Mongo database', (done) => {
        dbConnect('mongodb://localhost/fielding_chat_test', (res) => {
          res.should.equal(true);
          dbDisconnect();
          done();
        });
      });
    });
    describe('dbDisconnect()', () => {
      it('should close the connection to the Mongo database', (done) => {
        dbConnect('mongodb://localhost/fielding_chat_test');
        dbDisconnect((res) => {
          res.should.equal(true);
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
        dbCreateUser('test', (res) => {
          res.should.have.property('name');
          res.name.should.equal('test');
          res.should.have.property('created_at');
          done();
        });
      });
      it('should only add a user if the name is not taken', (done) => {
        dbCreateUser('test', () => {
          dbCreateUser('test', (res) => {
            res.should.equal(false);
            done();
          });
        });
      });
    });
    describe('dbGetUsers()', () => {
      it('should get a list of users and pass them to the callback', (done) => {
        dbGetUsers((res) => {
          res.should.be.a('array');
          done();
        });
      });
    });
    describe('dbCreateMessage()', () => {
      it('should add a new message to the database', (done) => {
        dbCreateUser('test', (userRes) => {
          dbCreateMessage(userRes._id, 'test message', (msgRes) => {
            msgRes.should.have.property('user_id');
            msgRes.user_id.should.equal(userRes._id);
            msgRes.should.have.property('text');
            msgRes.text.should.equal('test message');
            done();
          });
        });
      });
    });
    describe('dbCreateLog()', () => {
      it('should add a new log to the database', (done) => {
        dbCreateUser('test1', (userRes1) => {
          dbCreateUser('test2', (userRes2) => {
            dbCreateMessage(userRes1._id, 'foo', (msgRes1) => {
              dbCreateMessage(userRes2._id, 'foo', (msgRes2) => {
                dbCreateLog([userRes1._id, userRes2._id], [msgRes1._id, msgRes2._id], (logRes) => {
                  logRes.should.have.property('user_ids');
                  logRes.user_ids[0].should.equal(userRes1._id);
                  logRes.user_ids[1].should.equal(userRes2._id);
                  logRes.should.have.property('message_ids');
                  logRes.message_ids[0].should.equal(msgRes1._id);
                  logRes.message_ids[1].should.equal(msgRes2._id);
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
