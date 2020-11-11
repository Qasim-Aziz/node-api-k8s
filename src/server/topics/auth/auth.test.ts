import { setUp } from 'src/server/tests/tester.base';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';

//todo make some tests with uppercase pseudo or email, since everything is constraint into lowercase in the server
//todo tests seem to be running in parallel, and when user email si the same than in another test, it seems to be a problem

describe('# Auth Tests', () => {
  const user1 = { email: 'userauthtest@yopmail.com', pseudo: 'mh', password: 'pwd' };

  setUp(async () => {
    await InitDBService.truncateTables();
  });

  test('should register the user', () => Testers.registerUser(user1));

  test('should logout the user', () => Testers.logoutUser(user1));

  test('should login again the user', () => Testers.loginUser(user1));
});
