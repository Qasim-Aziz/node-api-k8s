import httpStatus from 'http-status';
import request from 'supertest';

import app from 'server/index'; // eslint-disable-line no-unused-vars
import expect from 'server/helpers/test.framework';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

export const getUser = async (credentials) => {
  await request(app)
    .get('/api/users/me')
    .set('Authorization', credentials.token)
    .expect(httpStatus.OK)
    .then((res) => {
      expect(true).to.equal(true);
    });
};
