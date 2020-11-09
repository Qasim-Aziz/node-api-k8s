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
