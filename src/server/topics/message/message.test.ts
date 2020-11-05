import httpStatus from 'http-status';
import { setUp } from 'src/server/tests/tester.base';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';
import { EMOTION_CODE, PRIVACY_LEVEL } from 'src/server/constants';

const user1 = { email: 'user1@yopmail.com', pseudo: 'user1', password: 'pwd' };
const user2 = { email: 'user2@yopmail.com', pseudo: 'user2', password: 'pwd' };
const user3 = { email: 'user3@yopmail.com', pseudo: 'user3', password: 'pwd' };
const message1 = { content: 'message 1 content', privacy: PRIVACY_LEVEL.PRIVATE, emotionCode: EMOTION_CODE.APAISE };
const message2 = { content: 'message 2 content', privacy: PRIVACY_LEVEL.PUBLIC, emotionCode: EMOTION_CODE.NERVEUX, traitNames: ['anxiete'] };
const message3 = { content: 'message 3', privacy: PRIVACY_LEVEL.PUBLIC, emotionCode: EMOTION_CODE.NERVEUX, traitNames: [] };
const message4 = { content: 'message 4', privacy: PRIVACY_LEVEL.PUBLIC, emotionCode: EMOTION_CODE.NERVEUX, traitNames: [] };
const message5 = { content: 'message 5', privacy: PRIVACY_LEVEL.PRIVATE, emotionCode: EMOTION_CODE.NERVEUX, traitNames: [] };
const message2Update = { content: 'message 2 content update', traitNames: ['depression', 'phobie'] };

describe('# Message Tests', () => {
  setUp(async () => {
    await InitDBService.truncateTables();
    await Promise.all([user1, user2, user3].map(p => Testers.registerUser(p)));
  }, 40000);
  test('should publish a new message', () =>
    Testers.publishMessage(user1, message1));
  test('should publish a new message with tags', () =>
    Testers.publishMessage(user2, message2));
  test('shouldnt update an existing message if not mine', () =>
    Testers.updateMessage(user1, message2.id, {}, { status: httpStatus.FORBIDDEN }));
  test('should update an existing message only if mine', () =>
    Testers.updateMessage(user2, message2.id, message2Update, { nbLoves: 0, nbViews: 0 }));
  test('shouldnt get a private message if not mine', () =>
    Testers.getMessage(user2, message1.id, { status: httpStatus.FORBIDDEN }));
  test('should get a private message if mine and not update viewing count', () =>
    Testers.getMessage(user1, message1.id, { nbViews: 0, nbLoves: 0 }));
  test('should get a public message even if not mine', () =>
    Testers.getMessage(user1, message2.id, { nbLoves: 0, nbViews: 1 }));
  test('shouldnt be able to love a private message', () =>
    Testers.loveMessage(user2, message1.id, { status: httpStatus.BAD_REQUEST }));
  test('should love a public message and update nbLoves', () =>
    Testers.loveMessage(user1, message2.id, { nbLoves: 1, nbViews: 1 }));
  test('should unlove a public message', () =>
    Testers.loveMessage(user1, message2.id, { nbLoves: 0, nbViews: 1 }));
  test('should get the right next messages', async () => {
    // I don't use Promise all here because th&²²e time creation is important
    await Testers.publishMessage(user3, message3);
    await Testers.publishMessage(user2, message4);
    await Testers.publishMessage(user3, message5);
    // the viewing count due to another user should not affect next message
    await Testers.getMessage(user3, message4.id, { nbLoves: 0, nbViews: 1 });
    // user1 already saw message2. Message2 should not be the next message,
    // nor message1 because it's his message, nor message5 because it's private
    // so the order should be the following : message4, message3, message2, then again message4
    await Testers.getNextMessage(user1, { expectedMessageId: message4.id, nbViews: 2 });
    await Testers.getNextMessage(user1, { expectedMessageId: message3.id, nbViews: 1 });
    await Testers.getNextMessage(user1, { expectedMessageId: message2.id, nbViews: 2 });
    await Testers.getNextMessage(user1, { expectedMessageId: message4.id, nbViews: 3 });
  });
  test('should get all my messages, even private ones', () =>
    Testers.getAllMessages(user3, user3, { expectedMessagesIds: [message5.id, message3.id] }));
  test('should only get public messages of another user', () =>
    Testers.getAllMessages(user1, user3, { expectedMessagesIds: [message3.id] }));
  test('shouldnt delete a message if not mine', () =>
    Testers.deleteMessage(user1, message2.id, { status: httpStatus.FORBIDDEN }));
  test('should delete a message if mine', () =>
    Testers.deleteMessage(user1, message1.id));
  test('should search traits', () =>
    Testers.searchTraits(user1, 'dep', { expectedResults: ['depression'] }));
});

