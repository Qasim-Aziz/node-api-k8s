import statuses from 'statuses';
import httpStatus from 'http-status';
import {BackError, Env} from 'src/server/helpers';

// copy pasted from https://github.com/expressjs/api-error-handler/blob/master/index.js
// as they left some ugly console.error in their source code
export default function apiErrorHandler(err, req, res) { // eslint-disable-line no-unused-vars
  let status = err.status || err.statusCode || 500;
  if (status < 400) status = 500;

  if (err instanceof BackError) {
    return res.status(err.status).json({
      ...{
        message: err.message || httpStatus[err.status],
        stack: Env.isTest ? err.stack : {}
      },
      ...err
    });
  }

  const body = {
    status,
    ...!Env.isProd ? {stack: err.stack} : {},
    message: err.message,
  };
  // internal server errors
  if (status >= 500) {
    return res.status(status).json({ ...body, message: statuses[status] });
  }

  return res.status(status).json({
    ...body,
    ...(err.code || err.errorCode)? {code: err.code || err.errorCode}: {},
    ...(err.name) ? {name: err.name}: {},
    ...(err.type) ? {type: err.type}: {},
    ...(err.errors) ? {errors: err.errors}: {},
  });
}
