/**
 * @extends Error
 */
import httpStatus from 'http-status';
import { ENVS } from 'server/constants';
import config from 'config/env';

export class ExtendableError extends Error {
  constructor(message, status, { stack, code } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.code = code;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor.name);
    }
  }
}

export default class BackError extends ExtendableError {
  constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR,
    { stack = null, code = null, extraContextForSentry = null } = {}) {
    super(message, status, { stack, code, extraContextForSentry });
  }

  toJSON() {
    const obj = {
      message: this.message,
      status: this.status,
    };
    if (this.status < 500) {
      obj.name = this.name;
    }
    if (config.env !== ENVS.PROD) {
      obj.stack = this.stack;
    }
    return obj;
  }
}
