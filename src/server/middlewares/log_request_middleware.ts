import logger from 'server/helpers/logger';

const getRequestDataKeys = () => ['method', 'path', 'originalUrl', 'query', 'headers', 'body'];

const getRequestData = (req, res) => ({
  ..._.pick(req, getRequestDataKeys()),
  ...connectionInfo(req),
  route: res.locals.routeName,
  status: res.statusCode,
  contentLength: Number(res.getHeader('Content-Length') || res._contentLength),
  userId: req.user && req.user.id,
  userEmail: req.user && req.user.email,
  impersonatorId: req.impersonator && req.impersonator.id,
  impersonatorEmail: req.impersonator && req.impersonator.email,
});

const logInCommingRequest = (data) => logger.access_log(data, `${data.method} ${data.path} - ${data.status} - Incoming request`);

const logDurationRequest = (data, duration) => logger.access_log(data, `${data.method} ${data.path} - ${data.status} - ${duration.toFixed(2)} ms`);

const connectionInfo = (data) => ({
  remoteIp: data.connection.remoteAddress,
  remotePort: data.connection.remotePort,
});

export default function logRequestMiddleware(req, res, next) {
  logInCommingRequest({
    ..._.pick(req, getRequestDataKeys()),
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
}
