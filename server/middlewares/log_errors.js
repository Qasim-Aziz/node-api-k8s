import logger from 'server/helpers/logger';

const logErrors = function logErrors(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  if (status < 500) {
    logger.info(err);
  } else {
    logger.error(err);
  }
  next(err);
};

export default logErrors;
