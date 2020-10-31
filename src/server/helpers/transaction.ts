import sinon from 'sinon';
import { Sequelize } from 'sequelize';
import { sequelize } from 'src/orm/database';
import { Env } from 'src/server/helpers/env';
import { BackError } from 'src/server/helpers/error';
import { logger } from 'src/server/helpers/logger';
import {PromiseUtils} from "./promise";

export class TransactionContextManager {
  static _isActivated = true;
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
    const _block = async (transaction) => {
      if (checkTransactionIsUsed) stub = makeSequelizeQueryStub(transaction);
      transaction.addPostProcessing = addPostProcessing; // eslint-disable-line no-param-reassign
      return bloc(transaction);
    };

    const rv = await sequelize.transaction({}, _block);

    return { rv, postProcessingList };
  } finally {
    if (stub && checkTransactionIsUsed) sinon.restore(stub);
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
