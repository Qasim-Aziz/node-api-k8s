import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { Message, Tag, View, Love } from 'src/orm';
import { PRIVACY_LEVEL } from 'src/server/constants';
import {Checks} from "../../tests/tester.base";

export const publishMessage = async (user, message, { status = httpStatus.OK } = {}) => request(app)
  .post('/api/messages')
  .set('cookie', user.token)
  .send({ ...message, userId: user.id })
  .expect(status)
  .then((res) => {
    const messageRes = res.body.message;
    expect(messageRes).toMatchObject(message);
    expect(messageRes.nbLoves).toEqual(0);
    expect(messageRes.nbViews).toEqual(0);
    expect(messageRes.userId).toEqual(user.id);
    return Object.assign(message, messageRes);
  });

export const updateMessage = async (user, messageId, messageData, { status = httpStatus.OK, nbLoves = null, nbViews = null } = {}) => {
  const res = await request(app)
    .put(`/api/messages/${messageId}`)
    .set('cookie', user.token)
    .send(messageData)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  const { traitNames, ...otherAttributes } = messageData;
  expect(messageRes).toMatchObject(otherAttributes);
  if (messageData.traitNames) expect(messageRes.traitNames.sort()).toEqual(messageData.traitNames.sort());
  expect(messageRes.nbLoves).toEqual(nbLoves);
  expect(messageRes.nbViews).toEqual(nbViews);
  expect(messageRes.userId).toEqual(user.id);
  return messageRes;
};

export const getMessage = async (user, messageId, { status = httpStatus.OK, nbLoves = null, nbViews = null } = {}) => {
  const res = await request(app)
    .get(`/api/messages/${messageId}`)
    .set('cookie', user.token)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes.nbLoves).toEqual(nbLoves);
  expect(messageRes.nbViews).toEqual(nbViews);
  return messageRes;
};

export const getNextMessage = async (user, { status = httpStatus.OK, expectedMessageId = null, nbViews = null } = {}) => {
  const res = await request(app)
    .get('/api/messages/next')
    .set('cookie', user.token)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes.nbViews).toEqual(nbViews);
  expect(messageRes.id).toEqual(expectedMessageId);
  return messageRes;
};

export const loveMessage = async (user, messageId, { status = httpStatus.OK, nbLoves = null, nbViews = null } = {}) => {
  const res = await request(app)
    .post(`/api/messages/${messageId}/loveOrUnlove`)
    .set('cookie', user.token)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes.nbLoves).toEqual(nbLoves);
  expect(messageRes.nbViews).toEqual(nbViews);
  return messageRes;
};

export const deleteMessage = async (user, messageId, { status = httpStatus.OK } = {}) => {
  await request(app)
    .delete(`/api/messages/${messageId}`)
    .set('cookie', user.token)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  /*Checks.deactivate();
  const message = await Message.findByPk(messageId);
  expect(message).to.be.null();
  const tags = await Tag.findAll({ where: { messageId } });
  expect(tags).to.be.empty();
  const loves = await Love.findAll({ where: { messageId } });
  expect(loves).to.be.empty();
  const views = await View.findAll({ where: { messageId } });
  expect(views).to.be.empty();
  Checks.reactivate();*/
  return null;
};

export const searchTraits = async (user, q, { status = httpStatus.OK, expectedResults = [] } = {}) => {
  const res = await request(app)
    .get('/api/messages/searchTraits')
    .set('cookie', user.token)
    .query({ q })
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const traitsRes = res.body.traits;
  expect(traitsRes).toEqual(expectedResults);
  return traitsRes;
};

export const getAllMessages = async (user, requestedUser, { status = httpStatus.OK, expectedMessagesIds = [] } = {}) => {
  const res = await request(app)
    .get('/api/messages')
    .set('cookie', user.token)
    .query({ userId: requestedUser.id })
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messagesRes = res.body.messages;
  expect(messagesRes.map(m => m.id)).toEqual(expectedMessagesIds);
  if (user.id !== requestedUser.id) expect([...new Set(messagesRes.map(m => m.privacy))]).toEqual([PRIVACY_LEVEL.PUBLIC]);
  return messagesRes;
};
