import { logger, Utils } from 'src/server/helpers';

const getRequestDataKeys = () => ['method', 'path', 'originalUrl', 'query', 'headers', 'body'];

const getRequestData = (req, res) => ({
  ...Utils.pick(req, getRequestDataKeys()),
  route: res.locals.routeName,
  status: res.statusCode,
  // eslint-disable-next-line no-underscore-dangle
  contentLength: Number(res.getHeader('Content-Length') || res._contentLength),
  userId: req.user && req.user.id,
  userEmail: req.user && req.user.email,
  impersonatorId: req.impersonator && req.impersonator.id,
  impersonatorEmail: req.impersonator && req.impersonator.email,
});

const logInCommingRequest = (data) =>
  logger.child(data).info(`${data.method} ${data.path} - ${data.status} - Incoming request`);

const logDurationRequest = (data, duration) =>
  logger.child(data).info(`${data.method} ${data.path} - ${data.status} - ${duration.toFixed(2)} ms`);

const connectionInfo = (data) => ({
  remoteIp: data.connection.remoteAddress,
  remotePort: data.connection.remotePort,
});

export const appLogRequest = (req, res, next) => {
  logInCommingRequest({
    ...Utils.pick(req, getRequestDataKeys()),
    ...connectionInfo(req),
    state: 'incoming',
  });

  res.on('finish', () => {
    const diff = process.hrtime(res.start);
    const ms = diff[0] * 1e3 + diff[1] * 1e-6; // eslint-disable-line no-mixed-operators
    logDurationRequest({
      ...getRequestData(req, res),
      duration: ms,
      state: 'outgoing',
    }, ms);
  });
  next();
};
