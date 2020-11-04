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
