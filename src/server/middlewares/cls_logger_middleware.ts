import hyperid from 'hyperid';
import { clsProxifyExpressMiddleware } from 'cls-proxify/integration/express';
import { CLS_NAMESPACE } from 'src/server/constants';
import { logger } from 'src/server/helpers';

const baseReqLog = (req) => {
  const idGenerator = hyperid();
  const reqId = req.reqId || req.header('x-traefik-reqid') || req.header('x-request-id') || idGenerator();
  req.reqId = reqId;
  return {
    reqId,
    method: req.method,
    path: req.originalUrl,
    referer: req.headers.referer,
  };
};

export function clsLoggerMiddleware() {
  return clsProxifyExpressMiddleware(CLS_NAMESPACE, (req) => {
    const child = logger.logger.child({
      ...baseReqLog(req),
    });
    return child;
  });
}

export function clsUserLoggerMiddleware() {
  return clsProxifyExpressMiddleware(CLS_NAMESPACE, (req: any) => {
    const child = logger.logger.child({
      ...baseReqLog(req),
      user_id: req.user.id,
    });
    return child;
  });
}
