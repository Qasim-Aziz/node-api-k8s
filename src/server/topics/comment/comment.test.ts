import { setUp } from 'src/server/tests/tester.base';
import * as Testers from 'src/server/tests/testers';
import { PromiseUtils } from 'src/server/helpers';
import { InitDBService } from 'src/initdb/initdb.service';
import httpStatus from 'http-status';

describe('# Comments', () => {
  let user1;
  let user2;
  let user3;

  let message;

  let comment1;
  let comment2;

  setUp(async () => {
    await InitDBService.truncateTables();
    [user1, user2, user3] = await PromiseUtils.promiseMapSeries([{}, {}, {}], (user) => Testers.spawnUser(user));
    message = await Testers.spawnMessage(user1, {});
  });

  test('Should add comments to message', async () => {
    comment1 = await Testers.commentMessage(user2, message, 'this is a comment 1');
    comment2 = await Testers.commentMessage(user2, message, 'this is a comment 2');
    await Testers.getMessage(user2, message.id, { nbComments: 2, commented: true });
    await Testers.getMessageComments(user2, message, { expectedResults: [comment1.id, comment2.id], total: 2 });
    await Testers.getMessageComments(user2, message, {
      expectedResults: [comment2.id], total: 2, limit: 1, offset: 1,
    });
  });

  test('Should edit comment', () =>
    Testers.updateMessageComment(user2, comment2, 'this is updated message 2'));

  test('Should not edit comment if is not owner', () =>
    Testers.updateMessageComment(user3, comment2, 'a comment', { status: httpStatus.FORBIDDEN }));

  test('Should like comment', async () => {
    await Testers.loveComment(user3, comment1, { lovesCount: 1 });
    await Testers.loveComment(user2, comment1, { lovesCount: 2, isOwner: true });
    await Testers.loveComment(user3, comment1, { lovesCount: 1, loved: false });
    await Testers.getMessageComments(user2, message, { expectedResults: [comment1.id, comment2.id] });
  });

  test('Should not delete comment if is not owner', () =>
    Testers.deleteMessageComment(user3, comment2, { status: httpStatus.FORBIDDEN }));

  test('Should delete comment', async () => {
    await Testers.deleteMessageComment(user2, comment2);
    await Testers.getMessageComments(user2, message, { expectedResults: [comment1.id] });
  });
});
