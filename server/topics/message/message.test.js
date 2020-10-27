import { setUp } from 'server/helpers/tester.base';
import { InitDBService } from 'initdb/initdb.service';
import * as Testers from 'server/tests/testers';

describe('# Message Tests', async () => {
  setUp(async () => InitDBService.truncateTables());

  it('should publish a new message', () => {});
  it('shouldnt publish a new message if not logged', () => {});
  it('should update an existing message only if mine', () => {});
  it('shouldnt update an existing message if not mine', () => {});
  it('should get a public message even if not mine', () => {});
  it('shouldnt get a private message if not mine', () => {});
  it('should get a private message if mine', () => {});
  it('should count a new view if message get by another user', () => {});
  it('should comment a public message', () => {});
  it('shouldnt comment a private message', () => {});
  it('should like a public message and update nbLikes', () => {});
  it('shouldnt be able to like a private message', () => {});
  it('should unlike a public message', () => {});
  it('should send a request when someone click on the comments or scroll and update nbClicks', () => {});
  it('shouldnt delete a message if not mine', () => {});
  it('should delete a message if mine', () => {});
});
