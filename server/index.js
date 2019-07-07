import http from 'http';
import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars
import app from 'config/express';
import config from 'config/env';

export function listen() {
  const serverPort = process.env.OVERRIDE_PORT || config.port;

  const server = http.createServer(app);

  server.keepAliveTimeout = 120000;
  server.listen(serverPort, () => {
    logger.info(`server started on port ${serverPort} (${config.env})`);
  });
}

export default app;
