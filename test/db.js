import 'babel-polyfill';
import chai from 'chai';
import {
  dbConnect,
  dbDisconnect,
  dbCreateUser,
  dbGetUsers,
} from '../src/db.js';

const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);
chai.should();

describe('Mongo', () => {
  describe('dbConnect()', () => {
    it('should open a connection to the Mongo database', (done) => {
      dbConnect((res) => {
        res.should.equal(true);
        dbDisconnect();
        done();
      });
    });
  });
  describe('dbConnect()', () => {
    it('should close the connection to the Mongo database', (done) => {
      dbConnect();
      dbDisconnect((res) => {
        res.should.equal(true);
        done();
      });
    });
  });
});

describe('User', () => {
  before('start database', (done) => {
    dbConnect(() => {
      done();
    });
  });
  after('close database', (done) => {
    dbDisconnect(() => {
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
  });
  describe('dbGetUsers()', () => {
    it('should get a list of users and pass them to the callback', (done) => {
      dbGetUsers((res) => {
        res.should.be.a('array');
        done();
      });
    });
  });
});
