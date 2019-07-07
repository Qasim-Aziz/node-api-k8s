import sinon from 'sinon';
import { Sequelize } from 'sequelize/lib/sequelize';
import _ from 'server/helpers/lodash';
import { sequelize } from 'orm/index';
import { Env } from 'server/helpers/helpers';
import BackError from 'server/helpers/back.error';
import { createStub, restoreStub } from 'server/helpers/sinon.infra';
import { promiseMap } from 'server/helpers/promise';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

export class TransactionContextManager {
  static isTransactionChecked(check) {
    return TransactionContextManager.isActivated ? Env.isTest && check : false;
  }

  static deactivate() {
    TransactionContextManager._isActivated = false;
  }

  static reactivate() {
    TransactionContextManager._isActivated = true;
  }

  static get isActivated() {
    if (_.isUndefined(TransactionContextManager._isActivated)) return true;
    return TransactionContextManager._isActivated;
  }
}

const getErrorMessageEnd = (options) => {
  try {
    const modelName = options.model.getTableName();
    const type = options.type;
    return ` while doing ${type} on ${modelName}.`;
  } catch (e) {
    return '';
  }
};

const throwUndefined = (sql, options) => {
  const msgEnd = getErrorMessageEnd(options);
  const msg = `Transaction is not used everywhere in transaction context${msgEnd}`;
  throw new Error(msg);
};
const throwDifferentTransaction = (sql, options) => {
  const msgEnd = getErrorMessageEnd(options);
  const msg = `Another transaction used than the transaction context's${msgEnd}`;
  throw new Error(msg);
};

const makeSequelizeQueryStub = (transactionExpected) => {
  const stub = createStub(Sequelize.prototype, 'query');

  const isDifferentTransaction = (value) => {
    if (_.isUndefined(value.transaction)) return false;
    if (_.isNil(value.transaction)) return false;
    return value.transaction.id !== transactionExpected.id;
  };
  stub.withArgs(sinon.match.any, sinon.match({ transaction: undefined })).callsFake(throwUndefined);
  if (process.env.TRANSACTION_CONTEXT_HARD !== undefined) {
    stub.withArgs(sinon.match.any, sinon.match({ transaction: null })).callsFake(throwUndefined);
  }
  stub.withArgs(sinon.match.any, sinon.match(isDifferentTransaction)).callsFake(throwDifferentTransaction);
  stub.callThrough();
  return stub;
};

const execPostProcessing = async (processingFactory) => {
  try {
    await processingFactory();
  } catch (err) {
    if (Env.isTest) throw err;
    Sentry.sendWithExtra(err, { context: 'transaction_post_processing', during: 'transaction context' });
  }
};

const runBlock = async (bloc, check) => {
  let stub;
  const checkTransactionIsUsed = TransactionContextManager.isTransactionChecked(check);
  try {
    const postProcessingList = [];
    const addPostProcessing = postProc => postProcessingList.push(postProc);
    const rv = await sequelize.transaction({}, (transaction) => {
      if (checkTransactionIsUsed) stub = makeSequelizeQueryStub(transaction);
      transaction.addPostProcessing = addPostProcessing; // eslint-disable-line no-param-reassign
      return bloc(transaction);
    });
    return { rv, postProcessingList };
  } finally {
    if (stub && checkTransactionIsUsed) restoreStub(stub);
  }
};

export const addPostProcessing = async (transaction, blocToPostProcess) => {
  if (transaction) transaction.addPostProcessing(blocToPostProcess);
  else throw new BackError('No transaction for post-processing');
};

export const transactionContext = async (bloc, { check = true } = {}) => {
  const { rv, postProcessingList } = await runBlock(bloc, check);
  // post process needs to be sequential during test to avoid having multiple transaction stub simultaneously
  const promiseMapFunc = Env.isSentryEnabled ? promiseMap : Promise.mapSeries;
  const postProcessing = promiseMapFunc(postProcessingList, execPostProcessing);
  if (!Env.isSentryEnabled) await postProcessing;
  return rv;
};

export const transactionContextRolledBack = async (bloc) => {
  const rollBack = 'rollback in test';
  try {
    await transactionContext(async (transaction) => {
      await bloc(transaction);
      throw rollBack;
    });
  } catch (e) {
    if (e !== rollBack) throw e;
  }
};
