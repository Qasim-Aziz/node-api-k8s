import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/server/index'; // eslint-disable-line no-unused-vars
import expect from 'src/server/helpers/test.framework';


export const publishMessage = async (user, message, { status = httpStatus.OK } = {}) => {
  const res = await request(app)
    .post('/api/messages')
    .set('cookie', user.cookie)
    .send(message)
    .expect(status);
  const messageRes = res.body.message;
  expect(messageRes).to.containSubset(message);
  message.id = messageRes.id; //eslint-disable-line no-param-reassign
  return messageRes;
};
