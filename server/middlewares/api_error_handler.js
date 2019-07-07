import statuses from 'statuses';
import httpStatus from 'http-status';
import BackError from 'server/helpers/back.error';
import config from 'config/env';
import { ENVS } from 'server/constants';
import { Env } from 'server/helpers/helpers';

// copy pasted from https://github.com/expressjs/api-error-handler/blob/master/index.js
// as they left some ugly console.error in their source code
export default function apiErrorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = err.status || err.statusCode || 500;
  if (status < 400) status = 500;

  if (err instanceof BackError) {
    return res.status(err.status).json({
      ...{
        message: err.message || httpStatus[err.status],
        stack: Env.isDev ? err.stack : {}
      },
      ...err
    });
  }

  const body = { status };

  // show the stacktrace when not in production
  if (config.env !== ENVS.PROD) {
    body.stack = err.stack;
  }
  // internal server errors
  if (status >= 500) {
    body.message = statuses[status];
    return res.status(status).json(body);
  }

  // client errors
  body.message = err.message;

  if (err.code || err.errorCode) body.code = err.code || err.errorCode;
  if (err.name) body.name = err.name;
  if (err.type) body.type = err.type;
  if (err.errors) body.errors = err.errors;

  return res.status(status).json(body);
}
