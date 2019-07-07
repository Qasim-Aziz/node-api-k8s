import hyperid from 'hyperid';
import { clsProxifyExpressMiddleware } from 'cls-proxify/integration/express';
import { CLS_NAMESPACE } from 'server/constants';
import { baseLogger } from 'server/helpers/logger';

export default function clsLoggerMiddleware() {
  return clsProxifyExpressMiddleware(CLS_NAMESPACE, (req) => {
    const idGenerator = hyperid();
    const child = baseLogger.child({
      reqId: req.header('x-traefik-reqid') || req.header('x-request-id') || idGenerator(),
      method: req.method,
      path: req.originalUrl
    });
    return child;
  });
}
