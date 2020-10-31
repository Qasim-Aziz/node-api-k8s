import hyperid from 'hyperid';
import { clsProxifyExpressMiddleware } from 'cls-proxify/integration/express';
import { CLS_NAMESPACE } from 'src/server/constants';
import { logger } from 'src/server/helpers';

export default function clsLoggerMiddleware() {
  return clsProxifyExpressMiddleware(CLS_NAMESPACE, (req) => {
    const idGenerator = hyperid();
    return logger.logger.child({
      reqId: req.header('x-traefik-reqid') || req.header('x-request-id') || idGenerator(),
      method: req.method,
      path: req.originalUrl
    });
  });
}
