/* eslint-env node, mocha */

import 'babel-polyfill';
import chai from 'chai';
import app from '../src/api.js';
import * as db from '../src/db.js';

const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);
const should = chai.should();

const userNames = ['user1', 'user2', 'user3'];
const msgRefIds = ['1', '2', '3'];
const msgTexts = ['text1', 'text2', 'text3'];
const logNames = ['log1', 'log2', 'log3'];

function randomTestString(stringLength = 75) {
  const possible = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array(stringLength).fill('').map(() => {
    return possible.charAt(Math.random() * (possible.length - 1));
  }).join('');
}

function genericHEAD(endpoint) {
  it('should be able to respond with status code 200 to "Accept: application/hal+json"', (done) => {
    chai.request(app)
    .head(endpoint)
    .set('Accept', 'application/hal+json')
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      done();
    });
  });
  it('should respond with 406 to other media types', (done) => {
    chai.request(app)
    .head(endpoint)
    .set('Accept', 'foo')
    .end((err, res) => {
      should.exist(err);
      res.should.have.status(406);
      done();
    });
  });
}

function genericGET(endpoint) {
  it('should be able to respond with a body of type application/hal+json', (done) => {
    chai.request(app)
    .get(endpoint)
    .set('Accept', 'application/hal+json')
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('_links');
      const links = res.body._links;
      links.should.have.property('self');
      links.self.should.have.property('href');
      links.self.href.should.be.a('string');
      links.self.href.should.equal(endpoint);
      Object.values(links).forEach((rel) => {
        if (Array.isArray(rel)) {
          rel.forEach((link) => {
            link.should.have.property('href');
            link.href.should.be.a('string');
          });
        } else {
          rel.should.have.property('href');
          rel.href.should.be.a('string');
        }
      });
      done();
    });
  });
  it('should respond with 406 to other media types', (done) => {
    chai.request(app)
    .get(endpoint)
    .set('Accept', 'foo')
    .end((err, res) => {
      should.exist(err);
      res.should.have.status(406);
      done();
    });
  });
}

function idempotentGET(endpoint) {
  it('should respond with the same representation if requested multiple times', (done) => {
    let firstReqBody;
    let firstReqStatus;
    chai.request(app)
    .get(endpoint)
    .end((err, res) => {
      should.not.exist(err);
      firstReqBody = res.body;
      firstReqStatus = res.status;
      chai.request(app)
      .get(endpoint)
      .end((err2, res2) => {
        should.not.exist(err2);
        firstReqBody.should.deep.equal(res2.body);
        firstReqStatus.should.equal(res2.status);
        done();
      });
    });
  });
}

function badResource(endpoint) {
  it('should respond with 404 if the resource does not exist', (done) => {
    chai.request(app)
    .get(`${endpoint}${randomTestString(25)}`)
    .end((err) => {
      should.exist(err);
      err.status.should.equal(404);
      done();
    });
  });
}

function endpointMethods(endpoint, methods) {
  const allMethods = {
    HEAD: chai.request(app).head(endpoint),
    OPTIONS: chai.request(app).options(endpoint),
    GET: chai.request(app).get(endpoint),
    POST: chai.request(app).post(endpoint),
    PUT: chai.request(app).put(endpoint),
    DELETE: chai.request(app).del(endpoint),
    TRACE: chai.request(app).trace(endpoint),
  };
  Object.keys(allMethods)
  .filter((method) => { return methods.indexOf(method) === -1 ? method : false; })
  .forEach((method) => {
    it(`should respond with status code 405 to ${method}`, (done) => {
      allMethods[method]
      .end((err) => {
        err.should.have.status(405);
        done();
      });
    });
  });
}

function genericPOST(endpoint, body) {
  it('should respond with 201 (create a resource) if the request is valid', (done) => {
    chai.request(app)
    .post(endpoint)
    .set('Content-Type', 'application/json')
    .send(body)
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(201);
      done();
    });
  });

  it('should respond with 415 if the request media type is invalid', (done) => {
    chai.request(app)
    .post(endpoint)
    .set('Content-Type', 'text/plain')
    .send('text')
    .end((err) => {
      should.exist(err);
      err.status.should.equal(415);
      done();
    });
  });

  it('should respond with 400 if the request media type is valid but contains invalid data', (done) => {
    chai.request(app)
    .post(endpoint)
    .set('Content-Type', 'application/json')
    .send({})
    .end((err) => {
      should.exist(err);
      err.status.should.equal(400);
      done();
    });
  });
}

function idempotentPOST(endpoint, body) {
  it('should respond with the same representation if requested multiple times with the same data', (done) => {
    chai.request(app)
    .post(endpoint)
    .set('Content-Type', 'application/json')
    .send(body)
    .end((err1, res1) => {
      chai.request(app)
      .post(endpoint)
      .set('Content-Type', 'application/json')
      .send(body)
      .end((err2, res2) => {
        should.not.exist(err2);
        res1.status.should.equal(201);
        res2.status.should.equal(201);
        res1.headers.location.should.equal(res2.headers.location);
        done();
      });
    });
  });
}

function genericPUT(endpoint, body) {
  it('should respond with 200 (update a resource) if the request is valid', (done) => {
    chai.request(app)
    .put(endpoint)
    .set('Content-Type', 'application/json')
    .send(body)
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(200);
      done();
    });
  });

  it('should respond with 415 if the request media type is invalid', (done) => {
    chai.request(app)
    .put(endpoint)
    .set('Content-Type', 'text/plain')
    .send('text')
    .end((err) => {
      should.exist(err);
      err.status.should.equal(415);
      done();
    });
  });
}

function idempotentPUT(endpoint, body) {
  it('should respond with the same representation if requested multiple times with the same data', (done) => {
    chai.request(app)
    .put(endpoint)
    .set('Content-Type', 'application/json')
    .send(body)
    .end((err1, res1) => {
      chai.request(app)
      .put(res1.headers.location)
      .set('Content-Type', 'application/json')
      .send(body)
      .end((err2, res2) => {
        should.not.exist(err2);
        res1.status.should.equal(200);
        res2.status.should.equal(200);
        res1.headers.location.should.equal(res2.headers.location);
        done();
      });
    });
  });
}

describe('API', () => {
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

  beforeEach('populate database', (done) => {
    db.createUser(userNames[0], (err1, userRes1) => {
      db.createUser(userNames[1], (err2, userRes2) => {
        db.createMessage(userRes1._id, msgTexts[0], (err3, msgRes1) => {
          db.createMessage(userRes2._id, msgTexts[1], (err4, msgRes2) => {
            db.createLog([userRes1._id], [msgRes1._id], logNames[0], () => {
              db.createLog([userRes2._id], [msgRes2._id], logNames[1], () => {
                done();
              });
            });
          });
        });
      });
    });
  });

  afterEach('drop database', (done) => {
    db.drop(() => {
      done();
    });
  });

  describe('/api/v1', () => {
    endpointMethods('/api/v1/', ['HEAD', 'GET']);
    describe('HEAD', () => {
      genericHEAD('/api/v1');
    });
    describe('GET', () => {
      genericGET('/api/v1');
      idempotentGET('/api/v1');
    });
  });

  describe('/api/v1/users', () => {
    endpointMethods('/api/v1/users/', ['HEAD', 'GET', 'POST']);
    describe('HEAD', () => {
      genericHEAD('/api/v1/users');
    });
    describe('GET', () => {
      genericGET('/api/v1/users');
      idempotentGET('/api/v1/users');
    });
    describe('POST', () => {
      const body = { name: userNames[2] };
      genericPOST('/api/v1/users', body);
      idempotentPOST('/api/v1/users', body);
    });
  });

  describe('/api/v1/users/:name', () => {
    endpointMethods(`/api/v1/users/${userNames[0]}`, ['HEAD', 'GET', 'PUT', 'DELETE']);
    describe('HEAD', () => {
      genericHEAD(`/api/v1/users/${userNames[0]}`);
    });
    describe('GET', () => {
      badResource('/api/v1/users/');
      genericGET(`/api/v1/users/${userNames[0]}`);
      idempotentGET(`/api/v1/users/${userNames[0]}`);
      it('should still send a correct represention even if the user name contains spaces', (done) => {
        db.createUser('user 1', () => {
          chai.request(app)
          .get('/api/v1/users/user 1/')
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.equal(200);
            done();
          });
        });
      });
    });
    describe('PUT', () => {
      describe('name', () => {
        const body = { name: userNames[1] };
        genericPUT(`/api/v1/users/${userNames[0]}`, body);
      });
    });
  });

  describe('/api/v1/messages', () => {
    endpointMethods('/api/v1/messages/', ['HEAD', 'GET', 'POST']);
    describe('HEAD', () => {
      genericHEAD('/api/v1/messages');
    });
    describe('GET', () => {
      genericGET('/api/v1/messages');
      idempotentGET('/api/v1/messages');
    });
    describe('POST', () => {
      genericPOST('/api/v1/messages', { user: userNames[0], text: msgTexts[2] });
    });
  });

  describe('/api/v1/messages/:ref_id', () => {
    endpointMethods(`/api/v1/messages/${msgRefIds[0]}`, ['HEAD', 'GET', 'PUT', 'DELETE']);
    describe('HEAD', () => {
      genericHEAD(`/api/v1/messages/${msgRefIds[0]}`);
    });
    describe('GET', () => {
      badResource('/api/v1/messages/');
      genericGET(`/api/v1/messages/${msgRefIds[0]}`);
      idempotentGET(`/api/v1/messages/${msgRefIds[0]}`);
    });
    describe('PUT', () => {
      describe('user', () => {
        const body = { user: userNames[1] };
        genericPUT(`/api/v1/messages/${msgRefIds[0]}`, body);
        idempotentPUT(`/api/v1/messages/${msgRefIds[0]}`, body);
      });
      describe('text', () => {
        const body = { text: msgTexts[1] };
        genericPUT(`/api/v1/messages/${msgRefIds[0]}`, body);
        idempotentPUT(`/api/v1/messages/${msgRefIds[0]}`, body);
      });
    });
  });

  describe('/api/v1/logs', () => {
    endpointMethods('/api/v1/logs/', ['HEAD', 'GET', 'POST']);
    describe('HEAD', () => {
      genericHEAD('/api/v1/logs');
    });
    describe('GET', () => {
      genericGET('/api/v1/logs');
      idempotentGET('/api/v1/logs');
    });
    describe('POST', () => {
      const body = { users: [userNames[0], userNames[1]], messages: [msgRefIds[0], msgRefIds[1]], name: logNames[2] };
      genericPOST('/api/v1/logs', body);
      idempotentPOST('/api/v1/logs', body);
    });
  });

  describe('/api/v1/logs/:name', () => {
    endpointMethods(`/api/v1/logs/${logNames[0]}`, ['HEAD', 'GET', 'PUT', 'DELETE']);
    describe('HEAD', () => {
      genericHEAD(`/api/v1/logs/${logNames[0]}`);
    });
    describe('GET', () => {
      badResource('/api/v1/logs/');
      genericGET(`/api/v1/logs/${logNames[0]}`);
      idempotentGET(`/api/v1/logs/${logNames[0]}`);
      it('should still send a correct represention even if the log name contains spaces', (done) => {
        db.createLog([], [], 'log 1', () => {
          chai.request(app)
          .get('/api/v1/logs/log 1/')
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.equal(200);
            done();
          });
        });
      });
    });
    describe('PUT', () => {
      describe('name', () => {
        const body = { name: logNames[2] };
        genericPUT(`/api/v1/logs/${logNames[0]}`, body);
        idempotentPUT(`/api/v1/logs/${logNames[0]}`, body);
      });
      describe('users', () => {
        const body = { users: [userNames[1]] };
        genericPUT(`/api/v1/logs/${logNames[0]}`, body);
        idempotentPUT(`/api/v1/logs/${logNames[0]}`, body);
      });
      describe('messages', () => {
        const body = { messages: [msgRefIds[1]] };
        genericPUT(`/api/v1/logs/${logNames[0]}`, body);
        idempotentPUT(`/api/v1/logs/${logNames[0]}`, body);
      });
    });
  });
});
