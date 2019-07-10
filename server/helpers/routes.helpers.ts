import { Request } from 'express';
import httpStatus from 'http-status';
import _ from 'server/helpers/lodash';

import validate from 'server/express-validation';
import BackError from 'server/helpers/back.error';

// @ts-ignore
import logger from 'server/helpers/logger'; // tslint:disable-line

export type SessionRequest = Request & {
  user: any;
  session: any;
  files: any;
};

// @ts-ignore
const multiJsonBody = keyPath => (req, res, next) => {
  if (req.is('multipart') && req.body[keyPath] !== undefined) {
    try {
      req.body = JSON.parse(req.body[keyPath]); // eslint-disable-line no-param-reassign
    } catch (err) {
      return next(new BackError(`Cannot parse multipart field "${keyPath}"`, httpStatus.BAD_REQUEST));
    }
    if (!_.isObject(req.body)) {
      return next(new BackError(`Multipart field "${keyPath}" must be an object`, httpStatus.BAD_REQUEST));
    }
  }
  return next();
};

// @ts-ignore
const addExpiresHeaderToResponse = (req, res, next) => {
  res.append('expires', -1);
  next();
};

export function routeTo(controller, method, {
  validateRequest = true,
  multipartJSONField = 'meta',
} = {}) {
  const middlewares = [addExpiresHeaderToResponse];

  middlewares.push(multiJsonBody(multipartJSONField));

  if (validateRequest && method.validation) {
    middlewares.push(validate(method.validation));
  }

  middlewares.push((req, res, next) => {
    Promise.resolve(method.call(controller, req, res, next))
      .catch(e => next(e));
  });
  return middlewares;
}
