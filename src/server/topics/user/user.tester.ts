import httpStatus from 'http-status';
import request from 'supertest';

import app from 'src/application';
import { checkExpectedStatus } from 'src/server/tests/tester.base';
import { registerUser } from 'src/server/topics/auth/auth.tester';
import { DEFAULT_PASSWORD } from 'src/server/tests/variables';

let userCounter = 0;

export const spawnUser = ({
  email = `user${userCounter}@yopmail.com`,
  pseudo = `user${userCounter}`,
  password = DEFAULT_PASSWORD,
} = {}) => registerUser({ email, pseudo, password })
  .then((user) => {
    userCounter += 1;
    return user;
  });

export const isEmailUsed = (email, { status = httpStatus.OK, emailUsed = null } = {}) =>
  request(app)
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

export const getAllFavorite = async (user, userId, { status = httpStatus.OK, expectedMessagesIds = [] } = {}) =>
  request(app)
    .get(`/api/users/${userId}/favorites`)
    .set('cookie', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (status !== httpStatus.OK) return null;
      const messagesRes = res.body.messages;
      expect(messagesRes.map((m) => m.id).sort()).toEqual(expectedMessagesIds.sort());
      return messagesRes;
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

export const getMe = async (user, {
  status = httpStatus.OK,
  expectedUserId = null,
} = {}) =>
  request(app)
    .get('/api/users/me')
    .set('cookie', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      const userRes = res.body.user;
      expect(userRes.id).toBe(expectedUserId);
    });
