import { setUp } from 'src/server/tests/tester.base';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';
import { GenderType } from 'src/server/constants';

const user1: any = {
  email: 'user1@yopmail.com', pseudo: 'user1', password: 'pwd', gender: GenderType.MALE,
};

describe('# Traits Tests', () => {
  setUp(async () => {
    await InitDBService.truncateTables();
    await Testers.registerUser(user1);
  });

  test('get all thesaurus traits', () => Testers.getThesaurus(user1));
});
