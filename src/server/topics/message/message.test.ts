import { setUp } from 'src/server/tests/tester.base';
import { InitDBService } from 'src/initdb/initdb.service';

describe('# Message Tests', () => {
  setUp(async () => InitDBService.truncateTables());

  test('should publish a new message', () => {});
  test('shouldnt publish a new message if not logged', () => {});
  test('should update an existing message only if mine', () => {});
  test('shouldnt update an existing message if not mine', () => {});
  test('should get a public message even if not mine', () => {});
  test('shouldnt get a private message if not mine', () => {});
  test('should get a private message if mine', () => {});
  test('should count a new view if message get by another user', () => {});
  test('should comment a public message', () => {});
  test('shouldnt comment a private message', () => {});
  test('should like a public message and update nbLikes', () => {});
  test('shouldnt be able to like a private message', () => {});
  test('should unlike a public message', () => {});
  test('should send a request when someone click on the comments or scroll and update nbClicks', () => {});
  test('shouldnt delete a message if not mine', () => {});
  test('should delete a message if mine', () => {});
});
