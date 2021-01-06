import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { checkExpectedStatus } from 'src/server/tests/tester.base';

export const setTrophee = async (user, messageId, tropheeCode, {
  status = httpStatus.OK,
  expectedUserTrophee = null,
  expectedMessageTrophees = null,
} = {}) =>
  request(app)
    .post('/api/trophees')
    .set('Authorization', user.token)
    .send({ messageId, tropheeCode })
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (status !== httpStatus.OK) return null;
      const messageRes = res.body.message;
      expect(messageRes.id).toEqual(messageId);
      expect(messageRes.connectedUserTrophee).toEqual(expectedUserTrophee);
      expect(messageRes.tropheesStats).toEqual(expectedMessageTrophees);
      return messageRes;
    });
