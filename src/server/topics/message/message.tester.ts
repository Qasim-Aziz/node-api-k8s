import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { Message, Tag, View, Like } from 'src/orm';
import { PRIVACY_LEVEL } from 'src/server/constants';

export const publishMessage = async (user, message, { status = httpStatus.OK } = {}) => {
  const res = await request(app)
    .post('/api/messages')
    .set('cookie', user.token)
    .send({ ...message, userId: user.id })
    .expect(status);
  const messageRes = res.body.message;
  expect(messageRes).to.containSubset(message);
  expect(messageRes.nbLikes).to.equal(0);
  expect(messageRes.nbViews).to.equal(0);
  expect(messageRes.userId).to.equal(user.id);
  message.id = messageRes.id;
  return messageRes;
};

export const updateMessage = async (user, messageId, messageData, { status = httpStatus.OK, nbLikes = null, nbViews = null } = {}) => {
  const res = await request(app)
    .put(`/api/messages/${messageId}`)
    .set('cookie', user.token)
    .send(messageData)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes).to.containSubset(messageData);
  if (messageData.traitNames) expect(messageRes.traitNames.sort()).to.deep.equal(messageData.traitNames.sort());
  expect(messageRes.nbLikes).to.equal(nbLikes);
  expect(messageRes.nbViews).to.equal(nbViews);
  expect(messageRes.userId).to.equal(user.id);
  return messageRes;
};

export const getMessage = async (user, messageId, { status = httpStatus.OK, nbLikes = null, nbViews = null } = {}) => {
  const res = await request(app)
    .get(`/api/messages/${messageId}`)
    .set('cookie', user.token)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes.nbLikes).to.equal(nbLikes);
  expect(messageRes.nbViews).to.equal(nbViews);
  return messageRes;
};

export const getNextMessage = async (user, { status = httpStatus.OK, expectedMessageId = null, nbViews = null } = {}) => {
  const res = await request(app)
    .get('/api/messages/next')
    .set('cookie', user.token)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes.nbViews).to.equal(nbViews);
  expect(messageRes.id).to.equal(expectedMessageId);
  return messageRes;
};

export const likeMessage = async (user, messageId, { status = httpStatus.OK, nbLikes = null, nbViews = null } = {}) => {
  const res = await request(app)
    .post(`/api/messages/${messageId}/likeOrUnlike`)
    .set('cookie', user.token)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes.nbLikes).to.equal(nbLikes);
  expect(messageRes.nbViews).to.equal(nbViews);
  return messageRes;
};

export const deleteMessage = async (user, messageId, { status = httpStatus.OK } = {}) => {
  await request(app)
    .delete(`/api/messages/${messageId}`)
    .set('cookie', user.token)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const message = await Message.findByPk(messageId);
  expect(message).to.be.null();
  const tags = await Tag.findAll({ where: { messageId } });
  expect(tags).to.be.empty();
  const likes = await Like.findAll({ where: { messageId } });
  expect(likes).to.be.empty();
  const views = await View.findAll({ where: { messageId } });
  expect(views).to.be.empty();
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
  expect(traitsRes).to.deep.equal(expectedResults);
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
  expect(messagesRes.map(m => m.id)).to.deep.equal(expectedMessagesIds);
  if (user.id !== requestedUser.id) expect([...new Set(messagesRes.map(m => m.privacy))]).to.deep.equal([PRIVACY_LEVEL.PUBLIC]);
  return messagesRes;
};
