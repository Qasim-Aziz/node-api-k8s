import { setUp } from 'src/server/tests/tester.base';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';

describe('# Auth Tests', () => {
  const user1 = { email: 'user1@yopmail.com', pseudo: 'MH', password: 'pwd' };

  setUp(async () => InitDBService.truncateTables());

  test('should register the user', () => Testers.registerUser(user1));

  test('should logout the user', () => Testers.logoutUser(user1.cookie));

  test('should login again the user', () => Testers.loginUser(user1));
});
