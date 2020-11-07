import sinon from 'sinon';
import { Sequelize } from 'sequelize';
import { sequelize } from 'src/orm/database';
import { Env } from 'src/server/helpers/env';
import { BackError } from 'src/server/helpers/error';
import { logger } from 'src/server/helpers/logger';
import { PromiseUtils } from 'src/server/helpers/promise';

export class TransactionContextManager {
  static isActivatedFlag = true;

  static isTransactionChecked(check) {
    return TransactionContextManager.isActivatedFlag ? Env.isTest && check : false;
  }

  static deactivate() {
    TransactionContextManager.isActivatedFlag = false;
  }

  static reactivate() {
    TransactionContextManager.isActivatedFlag = true;
  }

  static get isActivated() {
    return TransactionContextManager.isActivatedFlag;
  }
}

const getErrorMessageEnd = (options) => {
  try {
    console.log('options : ', options);
    const modelName = options.model.getTableName();
    const { type } = options;
    return ` while doing ${type} on ${modelName}.`;
  } catch (e) {
    return '';
  }
};

const throwUndefined = (sql, options) => {
  logger.debug('SQL statement', sql);
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
  const stub = sinon.stub(Sequelize.prototype, 'query');

  const isDifferentTransaction = (value) => {
    if (!value.transaction) return false;
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
    logger.error('transaction_post_processing', err);
  }
};

const runBlock = async (bloc, check, tid) => {
  let stub;
  const checkTransactionIsUsed = TransactionContextManager.isTransactionChecked(check);
  try {
    const postProcessingList = [];
    const addPostProcessing = (postProc) => postProcessingList.push(postProc);

    const rv = await sequelize.transaction({}, (transaction) => {
      if (checkTransactionIsUsed) stub = makeSequelizeQueryStub(transaction);
      Object.assign(transaction, { addPostProcessing });
      return bloc(transaction);
    });

    return { rv, postProcessingList };
  } finally {
    if (stub && checkTransactionIsUsed) stub.restore();
  }
};

export const addPostProcessing = (transaction, blocToPostProcess) => {
  if (transaction) transaction.addPostProcessing(blocToPostProcess);
  else throw new BackError('No transaction for post-processing');
};

// Please, DO NOT use lightly the forceAwaitProcessing option.
export const transactionContext = async (bloc, { check = true, tid = null, forceAwaitProcessing = false } = {}) => {
  const { rv, postProcessingList } = await runBlock(bloc, check, tid);
  // post process needs to be sequential during test to avoid having multiple transaction stub simultaneously
  const postProcessing = PromiseUtils.promiseMapSeries(postProcessingList, execPostProcessing);
  if (Env.isTest || forceAwaitProcessing) await postProcessing;
  return rv;
};
