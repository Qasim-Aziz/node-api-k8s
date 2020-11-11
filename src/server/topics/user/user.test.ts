import MockDate from 'mockdate';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';
import { setUp } from 'src/server/tests/tester.base';
import { moment } from 'src/server/helpers';
import { EmotionCode, PrivacyLevel } from 'src/server/constants';

const existingEmail = 'existing@yopmail.com';
const existingPseudo = 'existing';
const message1 = { content: 'message 1 content', privacy: PrivacyLevel.PRIVATE, emotionCode: EmotionCode.APAISE };
let user;
const pseudo = 'pseudotest';

describe('# Users Tests', () => {
  setUp(async () => {
    await InitDBService.truncateTables();
    await Testers.registerUser({ password: 'pwd', email: existingEmail, pseudo: existingPseudo });
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

    test('should compute the right stats for user', async () => {
      await Testers.publishMessage(user, message1);
      await Testers.getUser(user, user.id, { nbMessages: 1, connexionCount: 0, expectedUser: { pseudo } });
    });
  });
});
