import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { checkExpectedStatus } from 'src/server/tests/tester.base';

export const publishMessage = async (user, message, { status = httpStatus.OK } = {}) =>
  request(app)
    .post('/api/messages')
    .set('cookie', user.cookie)
    .send(message)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      const messageRes = res.body.message;
      expect(messageRes).to.containSubset(message);
      message.id = messageRes.id; // eslint-disable-line no-param-reassign
      return messageRes;
    });
