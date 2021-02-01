import MockDate from 'mockdate';
import httpStatus from 'http-status';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';
import { setUp } from 'src/server/tests/tester.base';
import { moment } from 'src/server/helpers';
import {
  DynamicLevel, EmotionCode, PrivacyLevel, GenderType,
} from 'src/server/constants';

const existingEmail = 'existing@yopmail.com';
const existingPseudo = 'existing';
const message1 = { content: 'message 1 content', privacy: PrivacyLevel.PRIVATE, emotionCode: EmotionCode.APAISE };
let user;
let anotherUser;
const pseudoData = 'pseudotest';

describe('# Users Tests', () => {
  setUp(async () => {
    await InitDBService.truncateTables();
    anotherUser = await Testers.registerUser({
      password: 'pwd', email: existingEmail, pseudo: existingPseudo, gender: GenderType.MALE,
    });
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
      user = await Testers.registerUser({
        password: 'pwd', email: 'xfzez@yopmail.com', pseudo: pseudoData, gender: GenderType.MALE,
      });
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

    test('should get me', () => {
      const { id, pseudo, description } = user;
      return Testers.getMe(user, { expectedUser: { id, pseudo, description } });
    });

    test('should update me with trait names', () =>
      Testers.updateMe(user, { description: 'Test', traitNames: ['Az', 'Bz'] }));

    test('should update me with different trait names', () =>
      Testers.updateMe(user, { traitNames: ['Bz', 'Cz'] }));

    test('should not update me with another user pseudo', () =>
      Testers.updateMe(user, { pseudo: existingPseudo }, { status: httpStatus.BAD_REQUEST }));

    test('should compute the right stats for user', async () => {
      await Testers.publishMessage(user, message1);
      await Testers.getUser(user, user.id, { nbMessages: 1, connexionCount: 0, expectedUser: { pseudo: pseudoData } });
    });

    test('should get current user', async () => {
      await Testers.getMe(user, { nbMessages: 1, connexionCount: 0, expectedUser: { pseudo: pseudoData } });
    });

    test('should follow user', async () => {
      await Testers.followOrUnfollow(user, anotherUser, { nbFollowers: 1 });
      await Testers.getFollowers(anotherUser, { followers: [user] });
      await Testers.getFollowed(user, { followed: [anotherUser] });
    });

    test('should unfollow user', async () => {
      await Testers.followOrUnfollow(user, anotherUser, { nbFollowers: 0 });
      await Testers.getFollowers(anotherUser, { followers: [] });
      await Testers.getFollowed(user, { followed: [] });
    });

    test('should resetPassword', async () => {
      const code = await Testers.forgetPassword(user.email);
      await Testers.resetPassword(user.email, code);
    });

    test('should update correctly user score', async () => {
      const userScore = await Testers.registerUser({
        password: 'pwd', email: 'userScore@yopmail.com', pseudo: 'userScore', gender: GenderType.MALE,
      });
      await Testers.getMe(userScore, { expectedUser: { totalScore: 0, remainingScore: 0 } });
      const message12points: any = {
        content: Array(1200).join('x'),
        privacy: PrivacyLevel.PUBLIC,
        emotionCode: EmotionCode.APAISE,
        traitNames: ['A', 'B', 'C', 'D', 'E', 'F'],
      };
      await Testers.publishMessage(userScore, message12points);
      await Testers.getMe(userScore, { expectedUser: { totalScore: 12, remainingScore: 12 } });
      await Testers.updateMessage(userScore, message12points.id, { content: 'abc', privacy: PrivacyLevel.PRIVATE });
      await Testers.getMe(userScore, { expectedUser: { totalScore: 3, remainingScore: 3 } });
      await Testers.deleteMessage(userScore, message12points.id);
      await Testers.getMe(userScore, { expectedUser: { totalScore: 0, remainingScore: 0 } });
      const comment2Points = await Testers.commentMessage(userScore, message1, Array(160).join('x'));
      await Testers.getMe(userScore, { expectedUser: { totalScore: 2, remainingScore: 2 } });
      await Testers.updateMessageComment(userScore, comment2Points, 'short comment');
      await Testers.getMe(userScore, { expectedUser: { totalScore: 1, remainingScore: 1 } });
      await Testers.deleteMessageComment(userScore, comment2Points);
      await Testers.getMe(userScore, { expectedUser: { totalScore: 0, remainingScore: 0 } });
    });

    test('should update correctly user score', async () => {
      const userDynamic = await Testers.registerUser({
        password: 'pwd', email: 'dynamic@yopmail.com', pseudo: 'dynamic', gender: GenderType.MALE,
      });
      await Testers.getMe(userDynamic, { expectedUser: { dynamic: DynamicLevel.NOUVEAU } });
      const messageGoodDynamic: any = { content: 'content', privacy: PrivacyLevel.PUBLIC, emotionCode: EmotionCode.HEUREUX };
      await Testers.publishMessage(userDynamic, messageGoodDynamic);
      await Testers.getMe(userDynamic, { expectedUser: { dynamic: DynamicLevel.EN_FORME } });
      await Testers.publishMessage(userDynamic,
        { content: 'content', privacy: PrivacyLevel.PUBLIC, emotionCode: EmotionCode.EFFONDRE });
      await Testers.getMe(userDynamic, { expectedUser: { dynamic: DynamicLevel.COUCI_COUCA } });
      await Testers.publishMessage(userDynamic,
        { content: 'content', privacy: PrivacyLevel.PUBLIC, emotionCode: EmotionCode.EFFONDRE });
      await Testers.getMe(userDynamic, { expectedUser: { dynamic: DynamicLevel.DES_JOURS_MEILLEURS } });
    });
  });
});
