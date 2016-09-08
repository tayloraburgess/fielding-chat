/* eslint-env node, mocha */

import 'babel-polyfill';
import chai from 'chai';
import app from '../src/app.js';

const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);
const should = chai.should();

function randomString(stringLength = 75) {
  const possible = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\n\t !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
  return Array(stringLength).fill('').map(() => {
    return possible.charAt(Math.random() * (possible.length - 1));
  }).join('');
}

function endpointMedia(endpoint) {
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

function endpointIdempotent(endpoint) {
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
    .get(`${endpoint}${randomString(25)}`)
    .end((err, res) => {
      should.exist(err);
      err.status.should.equal(404);
      done();
    });
  });
}

function endpointMethods(endpoint, methods) {
  const allMethods = {
    OPTIONS: chai.request(app).options(endpoint),
    GET: chai.request(app).get(endpoint),
    POST: chai.request(app).post(endpoint),
    PUT: chai.request(app).put(endpoint),
    DELETE: chai.request(app).delete(endpoint),
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

describe('/api/v1', () => {
  endpointMethods('/api/v1/', ['GET']);
  describe('GET', () => {
    endpointMedia('/api/v1');
    endpointIdempotent('/api/v1');
  });
});

describe('/api/v1/users', () => {
  endpointMethods('/api/v1/users/', ['GET', 'POST']);
  describe('GET', () => {
    endpointMedia('/api/v1/users');
    endpointIdempotent('/api/v1/users');
  });
});

describe('/api/v1/users/:name', () => {
  describe('GET', () => {
    badResource('/api/v1/users/');
  });
});

describe('/api/v1/messages', () => {
  endpointMethods('/api/v1/messages/', ['GET', 'POST']);
  describe('GET', () => {
    endpointMedia('/api/v1/messages');
    endpointIdempotent('/api/v1/messages');
  });
});

describe('/api/v1/messages/:ref_id', () => {
  describe('GET', () => {
    badResource('/api/v1/messages/');
  });
});

describe('/api/v1/logs', () => {
  endpointMethods('/api/v1/logs/', ['GET', 'POST']);
  describe('GET', () => {
    endpointMedia('/api/v1/logs');
    endpointIdempotent('/api/v1/logs');
  });
});

describe('/api/v1/logs/:name', () => {
  describe('GET', () => {
    badResource('/api/v1/logs/');
  });
});
