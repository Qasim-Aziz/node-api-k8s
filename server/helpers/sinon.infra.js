import sinon from 'sinon';
import _ from 'server/helpers/lodash';
import { Env } from 'server/helpers/helpers';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

export class SpyAndStubManager {
  static deactivate() {
    SpyAndStubManager.isActivated_ = false;
  }

  static reactivate() {
    SpyAndStubManager.isActivated_ = true;
  }

  static get isActivated() {
    if (_.isUndefined(SpyAndStubManager.isActivated_)) return true;
    return SpyAndStubManager.isActivated_;
  }
}

export const createSpy = (...args) => {
  const spyActivated = !Env.isTest && process.env.NO_SPY === undefined;
  if (spyActivated) {
    if (args.length === 0) return () => {};
    return args;
  }
  return sinon.spy(...args);
};

export const createStub = (...args) => {
  if (!SpyAndStubManager.isActivated) return null;
  return sinon.stub(...args);
};

export const restoreStub = (stub) => {
  if (SpyAndStubManager.isActivated) stub.restore();
};
