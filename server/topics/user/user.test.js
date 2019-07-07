import { InitDBService } from 'initdb/initdb.service';
import * as Testers from 'server/tests/testers';
import { setUp } from 'server/helpers/tester.base';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

describe('# Users Tests', async () => {
  let admin;

  setUp(async () => {
    await InitDBService.truncateTables();
  }, 40000);

  describe.skip('# Users', () => {
    it('should get user', () => Testers.getUser(admin));
  });
});
