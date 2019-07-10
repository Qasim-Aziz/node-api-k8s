import httpStatus from 'http-status';
import request from 'supertest';
import _ from 'server/helpers/lodash';

import app from 'server/index'; // eslint-disable-line no-unused-vars
import expect from 'server/helpers/test.framework';
import logger from 'server/helpers/logger';


export const registerUser = async (user, { status = httpStatus.OK } = {}) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send(user)
    .expect(status);
  const userRes = res.body.user;
  user.cookie = res.headers['set-cookie']; //eslint-disable-line no-param-reassign
  return userRes;
};

export const loginUser = async (email, password, { status = httpStatus.OK } = {}) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(status);
  return res.body.user;
};

export const logoutUser = async (cookie, { status = httpStatus.OK } = {}) => {
  logger.info(cookie)
  const res = await request(app)
    .post('/api/auth/logout')
    .set('cookie', cookie)
    .send({})
    .expect(status);
  const userRes = res.body.user;
  logger.info('res');
  logger.info(JSON.stringify(res, null, 2));
  return userRes;
};
