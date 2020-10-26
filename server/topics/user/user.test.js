import { InitDBService } from 'initdb/initdb.service';
import * as Testers from 'server/tests/testers';
import { setUp } from 'server/helpers/tester.base';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

const existingEmail = 'existing@yopmail.com';
const existingPseudo = 'existing';

describe('# Users Tests', async () => {
  setUp(async () => {
    await InitDBService.truncateTables();
    await Testers.registerUser({ password: 'pwd', email: existingEmail, pseudo: existingPseudo });
  }, 40000);

  describe('# Users', () => {
    it('should return true if pseudo is already used', () => Testers.isPseudoUsed(existingPseudo, { pseudoUsed: true }));

    it('should return false if pseudo is not used', () => Testers.isPseudoUsed('nonExistingPseudo', { pseudoUsed: false }));

    it('should return true if email is already used', () => Testers.isEmailUsed(existingEmail, { emailUsed: true }));

    it('should return false if email is not used', () => Testers.isEmailUsed('nonExisting@yopmail.com', { emailUsed: false }));
  });
});
