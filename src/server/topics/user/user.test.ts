import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';
import { setUp } from 'src/server/tests/tester.base';

const existingEmail = 'existing@yopmail.com';
const existingPseudo = 'existing';

describe('# Users Tests', () => {
  setUp(async () => {
    await InitDBService.truncateTables();
    await Testers.registerUser({ password: 'pwd', email: existingEmail, pseudo: existingPseudo });
  }, 40000);

  describe('# Users', () => {
    test('should return true if pseudo is already used', async () => Testers.isPseudoUsed(existingPseudo, { pseudoUsed: true }));

    test('should return false if pseudo is not used', async () => Testers.isPseudoUsed('nonexistingpseudo', { pseudoUsed: false }));

    test('should return true if email is already used', async () => Testers.isEmailUsed(existingEmail, { emailUsed: true }));

    test('should return false if email is not used', async () => Testers.isEmailUsed('nonexisting@yopmail.com', { emailUsed: false }));
  });
});
