/* eslint-disable no-unused-expressions */
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'chai/register-should';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import app, { resetDatabase, closeServer } from '../../../server-test';
import { JWT_SECRET } from '../../../server/config';
import * as modelUtils from '../../util/modelUtils';

const ethUtil = require('ethereumjs-util');
chai.use(chaiHttp);
const { expect } = chai;

describe('Thread Tests', () => {
  before('reset database', async () => {
    await resetDatabase();
  });

  describe('Thread Tests', () => {
    const markdownThread = require('../../util/fixtures/markdownThread');
    const community = 'staking';
    const chain = 'ethereum';
    let adminJWT;
    let adminAddress;
    let thread;

    before(async () => {
      const res = await modelUtils.createAndVerifyAddress({ chain });
      adminAddress = res.address;
      adminJWT = jwt.sign({ id: res.user_id, email: res.email }, JWT_SECRET);
      const isAdmin = await modelUtils.assignAdmin(res.address_id, chain);
      expect(adminAddress).to.not.be.null;
      expect(adminJWT).to.not.be.null;
      expect(isAdmin).to.not.be.null;
      const res2 = await modelUtils.createThread({
        chain,
        address: adminAddress,
        jwt: adminJWT,
        title: decodeURIComponent(markdownThread.title),
        body: decodeURIComponent(markdownThread.body),
        privacy: true,
        readOnly: true,
        tags: ['tag', 'tag2', 'tag3'],
      });
      expect(res2.status).to.be.equal('Success');
      expect(res2.result).to.not.be.null;
      thread = res2.result;
    });

    it('should pass /editThread', async () => {
      const thread_id = thread.id;
      const kind = thread.kind;
      const body = thread.body;
      const recentEdit : any = { timestamp: moment(), body };
      const versionHistory = JSON.stringify(recentEdit);
      const readOnly = true;
      const privacy = true;
      const res = await chai.request(app)
        .post('/api/editThread')
        .set('Accept', 'application/json')
        .send({
          'thread_id': thread_id, // find index
          'kind': kind, // find index
          'body': encodeURIComponent(body),
          'version_history': versionHistory,
          'attachments[]': null,
          'privacy': privacy,
          'read_only': readOnly,
          'jwt': adminJWT,
        });
      expect(res.body.result).to.not.be.null;
      expect(res.body.result.read_only).to.be.equal(false);
      expect(res.body.result.private).to.be.equal(false);
      expect(res.body).to.not.be.null;
      expect(res.body.status).to.be.equal('Success');
    });
  });
});
