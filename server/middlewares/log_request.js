import logger from 'server/helpers/logger';

function logRequestMiddleware() {
  return function logRequest(req, res, next) {
    const start = process.hrtime();
    logger.debug({
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      query: req.query,
      headers: req.headers,
      body: req.body,
    }, 'Incoming request');

    res.on('finish', () => {
      const diff = process.hrtime(start);
      const ms = diff[0] * 1e3 + diff[1] * 1e-6; // eslint-disable-line no-mixed-operators
      logger.info({
        method: req.method,
        path: req.path,
        duration: ms,
        status: res.status,
        originalUrl: req.originalUrl,
        query: req.query,
        headers: req.headers,
        body: req.body,
        userId: req.user && req.user.id,
      }, `${req.method} ${req.path} - ${res.statusCode} - ${ms.toFixed(2)} ms`);
    });
    next();
  };
}

export default logRequestMiddleware;
