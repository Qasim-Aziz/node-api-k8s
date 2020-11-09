import { setUp } from 'src/server/tests/tester.base';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';

//todo make some tests with uppercase pseudo or email, since everything is constraint into lowercase in the server

describe('# Auth Tests', () => {
  const user1 = { email: 'userauthtest@yopmail.com', pseudo: 'mh', password: 'pwd' };

  setUp(async () => InitDBService.truncateTables());

  test('should register the user', async () => Testers.registerUser(user1));

  test('should logout the user', async () => Testers.logoutUser(user1));

  test('should login again the user', async () => Testers.loginUser(user1));
});
