import httpStatus from 'http-status';
import BackError from 'server/helpers/back.error';
import { MULTER_ERROR_CODE_MAX_FILE_UPLOAD } from 'server/constants';
import expressValidation from 'server/express-validation';

function getStatus(err) {
  if (err.code === MULTER_ERROR_CODE_MAX_FILE_UPLOAD) return httpStatus.REQUEST_ENTITY_TOO_LARGE;
  return err.status;
}

// if error is not an instanceOf BackError, convert it.
const converterErrorHandler = function converterErrorHandler(err, req, res, next) {
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
    return next(new BackError(unifiedErrorMessage, err.status, true));
  } else if (!(err instanceof BackError)) {
    return next(new BackError(err.message, getStatus(err), err));
  }
  return next(err);
};

export default converterErrorHandler;
