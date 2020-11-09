import httpStatus from 'http-status';
import request from 'supertest';

import app from 'src/application';
import { checkExpectedStatus } from 'src/server/tests/tester.base';

export const isEmailUsed = (email, { status = httpStatus.OK, emailUsed = null } = {}) => request(app)
  .get('/api/users/by-email')
  .query({ email })
  .expect(checkExpectedStatus(status))
  .then((res) => {
    expect(res.body.emailUsed).toBe(emailUsed);
  });

export const isPseudoUsed = async (pseudo, { status = httpStatus.OK, pseudoUsed = null } = {}) =>
  request(app)
    .get('/api/users/by-pseudo')
    .query({ pseudo })
    .expect(checkExpectedStatus(status))
    .then((res) => {
      expect(res.body.pseudoUsed).toBe(pseudoUsed);
    });

export const refreshUserLastConnexionDate = async (user, userId, { status = httpStatus.OK, connexionCount = 0 } = {}) =>
  request(app)
    .post(`/api/users/${userId}/refreshUserLastConnexionDate`)
    .set('cookie', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      const resUser = res.body.user;
      expect(resUser.nbConsecutiveConnexionDays).toEqual(connexionCount);
    });

export const getUser = async (user, userId, {
  status = httpStatus.OK,
  expectedUser = null,
  connexionCount = null,
  nbMessages = null,
} = {}) =>
  request(app)
    .get(`/api/users/${userId}`)
    .set('cookie', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      const userRes = res.body.user;
      if (nbMessages) expect(userRes.nbMessages).toBe(nbMessages);
      if (connexionCount) expect(userRes.nbConsecutiveConnexionDays).toEqual(connexionCount);
      if (expectedUser) expect(userRes).toMatchObject(expectedUser);
    });
