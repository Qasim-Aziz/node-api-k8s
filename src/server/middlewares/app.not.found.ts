import httpStatus from 'http-status';
import { BackError } from 'src/server/helpers';

export function appNotFound(req, res, next) {
  next(new BackError(`Route ${req.originalUrl} Not Found`, httpStatus.NOT_FOUND));
}
