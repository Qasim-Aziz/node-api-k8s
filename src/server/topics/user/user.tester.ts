import httpStatus from 'http-status';
import request from 'supertest';

import app from 'src/application'; // eslint-disable-line no-unused-vars

export const isEmailUsed = (email, { status = httpStatus.OK, emailUsed = null } = {}) => request(app)
  .get('/api/users/by-email')
  .query({ email })
  .expect(status)
  .then((res) => {
    expect(res.body.emailUsed).toBe(emailUsed);
  });

export const isPseudoUsed = async (pseudo, { status = httpStatus.OK, pseudoUsed = null } = {}) => {
  await request(app)
    .get('/api/users/by-pseudo')
    .query({ pseudo })
    .expect(status)
    .then((res) => {
      expect(res.body.pseudoUsed).toBe(pseudoUsed);
    });
};
