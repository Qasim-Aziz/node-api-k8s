export function addExpiresHeaderMiddleware(req, res, next) {
  res.append('expires', -1);
  next();
}
