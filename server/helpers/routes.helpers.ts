import express, { Request } from 'express';
import _ from 'server/helpers/lodash';
import httpStatus from 'http-status';

import { SESSION_ERRORS } from 'server/constants';
import validate from 'server/express-validation';
import BackError from 'server/helpers/back.error';
import { Env } from 'server/helpers/helpers';

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

// Fix IE : prevents browser from caching resources obtained through GET requests
// @ts-ignore
const addExpiresHeaderToResponse = (req, res, next) => {
  res.append('expires', -1);
  next();
};

export const getToken = req => req.header('Authorization') || req.cookies.token;

const sessionManager = express.Router();
sessionManager.use([async (req: SessionRequest, res, next) => {
  //todo adapt with passport
  req.user = {}; // tslint:disable-line
  try {
    req.session = {}; // tslint:disable-line
    req.user = {} ; // tslint:disable-line
    next();
  } catch (error) {
    if (!(error instanceof BackError)) throw new BackError(error);
    if (error.status === SESSION_ERRORS.BAD_REQUEST.STATUS) next();
    else res.status(error.status).json(_.pick(error, ['message', 'code']));
  }
}]);

export function routeTo(controller, method, {
  validateRequest = true,
  controlSession = true,
  gone = false,
  multipartJSONField = 'meta',
} = {}) {
  const middlewares = [addExpiresHeaderToResponse];

  middlewares.push(multiJsonBody(multipartJSONField));

  if (controlSession) {
    middlewares.push(sessionManager);
  }

  if (validateRequest && method.validation) {
    middlewares.push(validate(method.validation));
  }

  if (gone) {
    // @ts-ignore
    middlewares.push((req, res, next) => {
      next(Env.isTest ? undefined : new BackError('Deprecated', httpStatus.GONE));
    });
  }

  middlewares.push((req, res, next) => {
    Promise.resolve(method.call(controller, req, res, next))
      .catch(e => next(e));
  });
  return middlewares;
}
