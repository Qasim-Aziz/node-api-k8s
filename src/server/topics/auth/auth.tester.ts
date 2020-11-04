import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { CookiesManager } from 'src/server/acl/cookies-manager';
import { checkExpectedStatus } from 'src/server/tests/tester.base';

const getToken = (res) => {
  expect(res.headers['set-cookie']).toBeDefined();
  const cookies = CookiesManager.extractCookies(res);
  expect(cookies.token).toBeDefined();
  return cookies.token;
};

export const registerUser = (user, { status = httpStatus.OK } = {}) =>
  request(app)
    .post('/api/auth/register')
    .send(user)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      const token = getToken(res);
      return Object.assign(user, res.body.user, { token });
    });

export const loginUser = async (user, { status = httpStatus.OK } = {}) =>
  request(app)
    .post('/api/auth/login')
    .send(user)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      const token = getToken(res);
      return Object.assign(user, res.body.user, { token });
    });

export const logoutUser = async (user, { status = httpStatus.OK } = {}) =>
  request(app)
    .post('/api/auth/logout')
    .set('Authorization', user.token)
    .send({})
    .expect(checkExpectedStatus(status))
    .then((res) => {
      expect(res.body.status).toBe('Ok');
      const cookies = CookiesManager.extractCookies(res);
      console.log(cookies);
      return Object.assign(user, { token: null });
    });
