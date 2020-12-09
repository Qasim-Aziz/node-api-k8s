import MockDate from 'mockdate';
import httpStatus from 'http-status';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';
import { setUp } from 'src/server/tests/tester.base';
import { moment } from 'src/server/helpers';
import { EmotionCode, PrivacyLevel } from 'src/server/constants';

const existingEmail = 'existing@yopmail.com';
const existingPseudo = 'existing';
const message1 = { content: 'message 1 content', privacy: PrivacyLevel.PRIVATE, emotionCode: EmotionCode.APAISE };
let user;
let anotherUser;
const pseudo = 'pseudotest';

describe('# Users Tests', () => {
  setUp(async () => {
    await InitDBService.truncateTables();
    anotherUser = await Testers.registerUser({ password: 'pwd', email: existingEmail, pseudo: existingPseudo });
  }, 40000);

  describe('# Users', () => {
    test('should return true if pseudo is already used', () =>
      Testers.isPseudoUsed(existingPseudo, { pseudoUsed: true }));

    test('should return false if pseudo is not used', () =>
      Testers.isPseudoUsed('nonexistingpseudo', { pseudoUsed: false }));

    test('should return true if email is already used', () =>
      Testers.isEmailUsed(existingEmail, { emailUsed: true }));

    test('should return false if email is not used', () =>
      Testers.isEmailUsed('nonexisting@yopmail.com', { emailUsed: false }));

    test('should refresh nb consecutive connexion days', async () => {
      MockDate.set(moment().subtract({ day: 3 }).valueOf());
      user = await Testers.registerUser({ password: 'pwd', email: 'xfzez@yopmail.com', pseudo });
      MockDate.reset();
      MockDate.set(moment().subtract({ day: 2 }).valueOf());
      // connexion 1 day after, should update the counter to +1
      await Testers.refreshUserLastConnexionDate(user, user.id, { connexionCount: 1 });
      // second connexion the same day : it should find the same count
      await Testers.refreshUserLastConnexionDate(user, user.id, { connexionCount: 1 });
      MockDate.reset();
      // connexion after two days, should be 0 consecutive days
      await Testers.refreshUserLastConnexionDate(user, user.id, { connexionCount: 0 });
    });

    test('should get me', () => Testers.getMe(user, { expectedUserId: user.id }));

    test('should update me', () =>
      Testers.updateUser(user, user.id, { description: 'Test' }));

    test('should not update another user', () =>
      Testers.updateUser(user, anotherUser.id, {}, { status: httpStatus.FORBIDDEN }));

    test('should not update me with another user pseudo', () =>
      Testers.updateUser(user, user.id, { pseudo: existingPseudo }, { status: httpStatus.BAD_REQUEST }));

    test('should compute the right stats for user', async () => {
      await Testers.publishMessage(user, message1);
      await Testers.getUser(user, user.id, { nbMessages: 1, connexionCount: 0, expectedUser: { pseudo } });
    });

    test('should get current user', async () => {
      await Testers.getMe(user, { nbMessages: 1, connexionCount: 0, expectedUser: { pseudo } });
    });

    test('should update correctly user score', async () => {
      const userScore = await Testers.registerUser({ password: 'pwd', email: 'userScore@yopmail.com', pseudo: 'userScore' });
      await Testers.getMe(userScore, { expectedUser: { totalScore: 0, remindingScore: 0 } });
      const message12points = {
        content: Array(1200).join('x'),
        privacy: PrivacyLevel.PUBLIC,
        emotionCode: EmotionCode.APAISE,
        traitNames: ['A', 'B', 'C', 'D', 'E', 'F'],
      };
      await Testers.publishMessage(userScore, message12points);
      await Testers.getMe(userScore, { expectedUser: { totalScore: 12, remindingScore: 12 } });
      await Testers.updateMessage(userScore, message12points.id, { content: 'abc', privacy: PrivacyLevel.PRIVATE });
      await Testers.getMe(userScore, { expectedUser: { totalScore: 3, remindingScore: 3 } });
      await Testers.deleteMessage(userScore, message12points.id);
      await Testers.getMe(userScore, { expectedUser: { totalScore: 0, remindingScore: 0 } });
    });
  });
});
