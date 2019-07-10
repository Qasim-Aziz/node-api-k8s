import { setUp } from 'server/helpers/tester.base';
import { InitDBService } from 'initdb/initdb.service';
import * as Testers from 'server/tests/testers';

describe('# Auth Tests', async () => {
  const user1 = { email: 'user1@yopmail.com', phone: '+33628450517', password: 'pwd' };

  setUp(async () => InitDBService.truncateTables());

  it('should register the user', () => Testers.registerUser(user1));

  it('should logout the user', () => Testers.logoutUser(user1.cookie, user1.email));
});
