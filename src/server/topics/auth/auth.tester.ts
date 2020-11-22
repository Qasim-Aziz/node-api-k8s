import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { CookiesManager } from 'src/server/acl/cookies-manager';
import { checkExpectedStatus } from 'src/server/tests/tester.base';
import { moment } from 'src/server/helpers';

const getToken = (res) => {
  expect(res.headers['set-cookie']).toBeDefined();
  const cookies = CookiesManager.extractCookies(res);
  expect(cookies.token).toBeDefined();
  return cookies.token;
};

export const registerUser = async (user, { status = httpStatus.OK } = {}) =>
  request(app)
    .post('/api/auth/register')
    .send(user)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      const token = getToken(res);
      const userRes = res.body.user;
      expect(userRes.nbConsecutiveConnexionDays).toEqual(0);
      expect(userRes.nbMessages).toEqual(0);
      expect(moment().diff(moment(userRes.lastConnexionDate), 'd')).toEqual(0);
      return Object.assign(user, userRes, { token });
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
      expect(cookies.token).toBe('');
      return Object.assign(user, { token: null });
    });

export const forgetPassword = async (email, { status = httpStatus.OK } = {}) =>
  request(app)
    .post('/api/users/forget-password')
    .send({ email })
    .expect(checkExpectedStatus(status))
    .then((res) => {
      expect(res.body.code).not.toBeUndefined();
      return res.body.code;
    });

export const resetPassword = async (email, code, { status = httpStatus.OK } = {}) =>
  request(app)
    .post('/api/users/reset-password')
    .send({ email, code })
    .expect(checkExpectedStatus(status))
    .then((res) => {
      const token = getToken(res);
      expect(res.body.user.shouldResetPassword).toBe(true);
      return { ...res.body.user, token };
    });
