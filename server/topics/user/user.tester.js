import httpStatus from 'http-status';
import request from 'supertest';

import app from 'server/index'; // eslint-disable-line no-unused-vars
import expect from 'server/helpers/test.framework';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

export const isEmailUsed = async (email, { emailUsed = null } = {}) => {
  await request(app)
    .get('/api/users/by-email')
    .query({ email })
    .expect(httpStatus.OK)
    .then((res) => {
      expect(res.body.emailUsed).to.equal(emailUsed);
    });
};

export const isPseudoUsed = async (pseudo, { pseudoUsed = null } = {}) => {
  await request(app)
    .get('/api/users/by-pseudo')
    .query({ pseudo })
    .expect(httpStatus.OK)
    .then((res) => {
      expect(res.body.pseudoUsed).to.equal(pseudoUsed);
    });
};
