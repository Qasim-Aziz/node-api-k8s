import {
  BackError, Env, logger, ValidationError,
} from 'src/server/helpers';

export const appErrorConverter = (err, req, res, next) => {
  if (Env.isTest) {
    logger.error(err);
  }
  if (err instanceof ValidationError) {
    const unifiedErrorMessage = err.errors.map((error) => error.messages.join('. ')).join(' and ');
    return next(new BackError(unifiedErrorMessage, err.status));
  } if (!(err instanceof BackError)) {
    return next(new BackError(err.message, err.status, err.stack));
  }
  return next(err);
};
