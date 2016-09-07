import 'babel-polyfill';
import chai from 'chai';
import {
  dbConnect,
  dbDisconnect,
  dbCreateUser,
  dbUserName,
  dbGetUsers
} from '../src/db.js';

const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);
const should = chai.should();

describe('Mongo', () => {
  describe('dbConnect()', () => {
    it('should open a connection to the Mongo database', (done) => {
      dbConnect((res) => {
        res.should.be.true;
        dbDisconnect();
        done();
      });
    });
  });
  describe('dbConnect()', () => {
    it('should close the connection to the Mongo database', (done) => {
      dbConnect();
      dbDisconnect((res) => {
        res.should.be.true;
        done();
      });
    });
  });
});

describe('User', () => {
  before('start database', (done) => {
    dbConnect((res) => {
      done();
    });
  });
  after('close database', (done) => {
    dbDisconnect((res) => {
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
        console.log(res);
        res.should.be.a('array');
        done();
      });
    });
  });
});