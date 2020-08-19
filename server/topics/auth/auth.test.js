import { setUp } from 'server/helpers/tester.base';
import { InitDBService } from 'initdb/initdb.service';
import * as Testers from 'server/tests/testers';

describe('# Auth Tests', async () => {
  const user1 = { email: 'user1@yopmail.com', pseudo: 'MH', password: 'pwd' };

  setUp(async () => InitDBService.truncateTables());

  it('should register the user', () => Testers.registerUser(user1));

  it('should logout the user', () => Testers.logoutUser(user1.cookie));

  it('should login again the user', () => Testers.loginUser(user1));
});
