import { setUp } from 'src/server/tests/tester.base';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';

describe('# Auth Tests', () => {
  const user1 = { email: 'user1@yopmail.com', pseudo: 'MH', password: 'pwd' };

  setUp(async () => InitDBService.truncateTables());

  test('should register the user', async () => Testers.registerUser(user1));

  test('should logout the user', async () => Testers.logoutUser(user1));

  test('should login again the user', async () => Testers.loginUser(user1));
});
