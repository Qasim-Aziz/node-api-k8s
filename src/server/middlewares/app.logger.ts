import hyperid from 'hyperid';
import { clsProxifyExpressMiddleware } from 'cls-proxify/integration/express';
import { CLS_NAMESPACE } from 'src/server/constants';
import { loggerBase } from 'src/server/helpers';

const baseReqLog = (req) => {
  req.tid = req.reqId || req.header('req-transaction-id') || req.header('x-transaction-id') || hyperid();
  return {
    tid: req.tid,
    method: req.method,
    path: req.originalUrl,
    referer: req.headers.referer,
  };
};

export function clsLoggerMiddleware() {
  return clsProxifyExpressMiddleware(CLS_NAMESPACE, (req) => loggerBase.child({
    ...baseReqLog(req),
  }));
}

export function clsUserLoggerMiddleware() {
  return clsProxifyExpressMiddleware(CLS_NAMESPACE, (req: any) => loggerBase.child({
    ...baseReqLog(req),
    user_id: req.user.id,
  }));
}
