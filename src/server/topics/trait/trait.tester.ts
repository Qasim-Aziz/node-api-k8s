import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { checkExpectedStatus } from 'src/server/tests/tester.base';

export const getThesaurus = async (user, {
  status = httpStatus.OK,
} = {}) =>
  request(app)
    .get('/api/traits/thesaurus')
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (status !== httpStatus.OK) return null;
      const traitsRes = res.body.traitNames;
      return traitsRes;
    });
