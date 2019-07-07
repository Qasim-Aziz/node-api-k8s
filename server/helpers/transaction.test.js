import { InitDBService } from 'initdb/initdb.service';
import { sequelize, User } from 'orm';

import moment from 'server/helpers/moment';
import { transactionContext, TransactionContextManager } from 'server/helpers/transaction';
import { isRejected, listEquals, setUp } from 'server/helpers/tester.base';
import expect from 'server/helpers/test.framework';
import { TestError } from 'server/helpers/errors';
import { createSpy } from 'server/helpers/sinon.infra';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

//todo todo unskip when one model is ready
describe.skip('# Transaction Context', () => {
  const bloc = (transaction, id = 1) => User.update({ updateAt: moment() }, {
    where: { id },
    transaction
  });
  const promMaker = () => transactionContext(() => bloc());
  const errorMessage = 'Transaction is not used everywhere in transaction context while doing BULKUPDATE on user.';
  describe('transaction', () => {
    setUp(async () => {
      await InitDBService.truncateTables();
    });

    it('should work if everything is in the transaction',
      () => transactionContext(bloc));

    it('should NOT throw if something if the transaction context is desactivated', async () => {
      TransactionContextManager.deactivate();
      await transactionContext(() => bloc());
      TransactionContextManager.reactivate();
      return isRejected(promMaker);
    });
    it('should be able to desactivate the check several times', async () => {
      TransactionContextManager.deactivate();
      await transactionContext(() => bloc());
      TransactionContextManager.deactivate();
      TransactionContextManager.reactivate();
      await isRejected(promMaker);
      TransactionContextManager.reactivate();
    });
    it('should throw if something is NOT in the transaction',
      () => isRejected(promMaker, { errorMessage }));
    it('should throw if the transaction used is not the same',
      async () => {
        const promMaker_ = () => transactionContext(async () => sequelize.transaction(bloc));
        const msg = 'Another transaction used than the transaction context\'s';
        await isRejected(promMaker_, { errorMessage: msg });
      });
  });
  describe('post processing', () => {
    const blocSpy = createSpy(bloc);
    it('should run the post-processing after a transaction', async () => {
      await transactionContext(async (transaction) => {
        transaction.addPostProcessing(() => blocSpy(null, 2));
        await blocSpy(transaction, 1);
      });
      expect(blocSpy.callCount).to.equal(2);
      const idCalledList = [0, 1].map(id => blocSpy.getCall(id).args[1]);
      listEquals(idCalledList, [1, 2]);
      blocSpy.reset();
    });
    it('should throw in post-processing', async () => {
      const blocThrow = () => {
        throw new TestError('blocThrow');
      };
      await isRejected(() => transactionContext(async (transaction) => {
        transaction.addPostProcessing(() => blocThrow());
        await blocSpy(transaction, 1);
      }), { errorMessage: 'blocThrow' });
      expect(blocSpy.callCount).to.equal(1);
      blocSpy.reset();
    });
  });
});
