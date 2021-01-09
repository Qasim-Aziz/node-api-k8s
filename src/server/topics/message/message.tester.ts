import httpStatus from 'http-status';
import request from 'supertest';
import app from 'src/application';
import { ContextType, EmotionCode, PrivacyLevel } from 'src/server/constants';
import { checkExpectedStatus } from 'src/server/tests/tester.base';

let messageCounter = 0;

const omitTraitNames = ({ traitNames, ...message }) => (message);

export const publishMessage = async (user, message, { status = httpStatus.OK } = {}) => request(app)
  .post('/api/messages')
  .set('Authorization', user.token)
  .send(message)
  .expect(checkExpectedStatus(status))
  .then((res) => {
    const messageRes = res.body.message;
    expect(messageRes).toMatchObject(omitTraitNames(message));
    if (message.traitNames) expect(messageRes.traitNames.sort()).toMatchObject(message.traitNames.sort());
    expect(messageRes.nbLoves).toEqual(0);
    expect(messageRes.nbViews).toEqual(0);
    expect(messageRes.userId).toEqual(user.id);
    return Object.assign(message, messageRes);
  });

export const spawnMessage = (user, {
  content = `message ${messageCounter} content`,
  privacy = PrivacyLevel.PUBLIC,
  emotionCode = EmotionCode.APAISE,
  traitNames = [],
}) => publishMessage(user, {
  content, privacy, emotionCode, traitNames,
})
  .then((message) => {
    messageCounter += 1;
    return message;
  });

export const updateMessage = async (user, messageId, messageData, { status = httpStatus.OK, nbLoves = null, nbViews = null } = {}) => {
  const res = await request(app)
    .put(`/api/messages/${messageId}`)
    .set('Authorization', user.token)
    .send(messageData)
    .expect(checkExpectedStatus(status));
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  const { traitNames, ...otherAttributes } = messageData;
  expect(messageRes).toMatchObject(otherAttributes);
  if (messageData.traitNames) expect(messageRes.traitNames.sort()).toEqual(messageData.traitNames.sort());
  if (nbLoves !== null) expect(messageRes.nbLoves).toEqual(nbLoves);
  if (nbViews !== null) expect(messageRes.nbViews).toEqual(nbViews);
  expect(messageRes.userId).toEqual(user.id);
  return messageRes;
};

export const getMessage = async (user, messageId, {
  status = httpStatus.OK,
  nbLoves = null,
  nbViews = null,
  loved = false,
  commented = false,
  nbComments = null,
} = {}) => {
  const res = await request(app)
    .get(`/api/messages/${messageId}`)
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status));
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  if (nbLoves !== null) expect(messageRes.nbLoves).toEqual(nbLoves);
  if (nbViews !== null) expect(messageRes.nbViews).toEqual(nbViews);
  if (nbComments !== null) expect(messageRes.nbComments).toEqual(nbComments);
  expect(messageRes.loved).toEqual(loved);
  expect(messageRes.commented).toEqual(commented);
  return messageRes;
};

export const getNextMessage = async (user, {
  status = httpStatus.OK, expectedMessageId = null, nbViews = null, context = ContextType.ALL,
} = {}) => {
  const res = await request(app)
    .get('/api/messages/next')
    .query({ context })
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status));
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes.nbViews).toEqual(nbViews);
  expect(messageRes.id).toEqual(expectedMessageId);
  return messageRes;
};

export const loveMessage = async (user, messageId, {
  status = httpStatus.OK,
  nbLoves = null,
  nbViews = null,
  loved = true,
  isFavorite = false,
} = {}) => {
  const res = await request(app)
    .post(`/api/messages/${messageId}/loveOrUnlove`)
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status));
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes.nbLoves).toEqual(nbLoves);
  expect(messageRes.nbViews).toEqual(nbViews);
  expect(messageRes.loved).toEqual(loved);
  expect(messageRes.isFavorite).toEqual(isFavorite);
  return messageRes;
};

export const addOrRemoveFavorite = async (user, messageId, {
  status = httpStatus.OK,
  nbLoves = null,
  nbViews = null,
  loved = true,
  isFavorite = false,
} = {}) => {
  const res = await request(app)
    .post(`/api/messages/${messageId}/addOrRemoveFavorite`)
    .set('cookie', user.token)
    .expect(status);
  if (status !== httpStatus.OK) return null;
  const messageRes = res.body.message;
  expect(messageRes.nbLoves).toEqual(nbLoves);
  expect(messageRes.nbViews).toEqual(nbViews);
  expect(messageRes.loved).toEqual(loved);
  expect(messageRes.isFavorite).toEqual(isFavorite);
  return messageRes;
};

export const deleteMessage = async (user, messageId, { status = httpStatus.OK } = {}) => {
  await request(app)
    .delete(`/api/messages/${messageId}`)
    .set('Authorization', user.token)
    .expect(checkExpectedStatus(status));
  if (status !== httpStatus.OK) return null;
  return null;
};

export const searchTraits = async (user, q, { status = httpStatus.OK, expectedResults = [] } = {}) => {
  const res = await request(app)
    .get('/api/messages/searchTraits')
    .set('Authorization', user.token)
    .query({ q })
    .expect(checkExpectedStatus(status));
  if (status !== httpStatus.OK) return null;
  const traitsRes = res.body.traits;
  expect(traitsRes).toEqual(expectedResults);
  return traitsRes;
};

export const getAllMessages = async (user, requestedUser, { status = httpStatus.OK, expectedMessagesIds = [] } = {}) => {
  const res = await request(app)
    .get('/api/messages')
    .set('Authorization', user.token)
    .query({ userId: requestedUser.id })
    .expect(checkExpectedStatus(status));
  if (status !== httpStatus.OK) return null;
  const messagesRes = res.body.messages;
  expect(messagesRes.map((m) => m.id).sort()).toEqual(expectedMessagesIds.sort());
  if (user.id !== requestedUser.id) expect([...new Set(messagesRes.map((m) => m.privacy))]).toEqual([PrivacyLevel.PUBLIC]);
  return messagesRes;
};

export const getAllFavorite = async (user, { status = httpStatus.OK, expectedMessagesIds = [] } = {}) =>
  request(app)
    .get('/api/messages/favorites')
    .set('cookie', user.token)
    .expect(checkExpectedStatus(status))
    .then((res) => {
      if (status !== httpStatus.OK) return null;
      const messagesRes = res.body.messages;
      expect(messagesRes.map((m) => m.id).sort()).toEqual(expectedMessagesIds.sort());
      return messagesRes;
    });
