import httpStatus from 'http-status';
import { Env } from 'src/server/helpers/env';

export class BackError extends Error {
  constructor(message, public status = httpStatus.INTERNAL_SERVER_ERROR, public stack = null) {
    super(message);
  }

  toJSON() {
    console.log();
    return {
      message: this.message,
      status: this.status,
      ...this.status < 500 ? { name: this.name } : {},
      ...!Env.isProd ? { stack: this.stack } : {},
    };
  }
}

export class ValidationError extends Error {
  errors;

  flatten;

  status;

  statusText;

  constructor(errors, options) {
    super('validation error');
    this.errors = errors;
    this.flatten = options.flatten;
    this.status = options.status;
    this.statusText = options.statusText;
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  toJSON() {
    if (this.flatten) return this.errors.map((e) => e.message).flatten();
    return {
      status: this.status,
      statusText: this.statusText,
      errors: this.errors,
    };
  }
}
