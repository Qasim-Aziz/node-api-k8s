import httpStatus from 'http-status';
import BackError from 'server/helpers/back.error';

export class FalseHypothesisError extends BackError {
  constructor(message = 'FALSE_HYPOTHESIS_ERROR') {
    super(message, httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class HookError extends BackError {
  constructor(msg, status = httpStatus.BAD_REQUEST) {
    super(msg, status);
  }
}


export class TestError extends Error {
  // eslint-disable-next-line no-useless-constructor
  constructor(msg) {
    super(msg);
  }
}
