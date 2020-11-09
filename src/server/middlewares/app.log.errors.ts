import { logger } from 'src/server/helpers';

export const appLogErrors = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status < 500) {
    logger.info(err);
  } else {
    logger.error(err);
  }
  next(err);
};
