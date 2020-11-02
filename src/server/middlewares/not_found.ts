import httpStatus from 'http-status';
import { BackError } from 'src/server/helpers';

export default function notFound(req, res, next) {
  next(new BackError(`Route ${req.originalUrl} Not Found`, httpStatus.NOT_FOUND));
}
