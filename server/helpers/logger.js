import { clsProxify } from 'cls-proxify';
import pino from 'pino';
import { CLS_NAMESPACE } from 'server/constants';

export const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

const logger = clsProxify(CLS_NAMESPACE, baseLogger);

export default logger;
