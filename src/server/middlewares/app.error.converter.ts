import { BackError, ValidationError } from 'src/server/helpers';

// if error is not an instanceOf BackError, convert it.
export const appErrorConverter = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map((error) => error.messages.join('. ')).join(' and ');
    return next(new BackError(unifiedErrorMessage, err.status));
  } if (!(err instanceof BackError)) {
    return next(new BackError(err.message, err.status, err.stack));
  }
  return next(err);
};
