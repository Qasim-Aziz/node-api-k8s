export function apiExpireHeader(req, res, next) {
  res.append('expires', -1);
  next();
}
