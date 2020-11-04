import { createLogger, transports, format } from 'winston';
import config from 'src/config';
import { Utils } from 'src/server/helpers/utils';

const {
  combine, timestamp, label, printf,
} = format;
let LOGGER;

class Logger {
  logger;

  constructor() {
    if (!LOGGER) {
      LOGGER = createLogger({
        format: combine(
          label({ label: 'backend' }),
          timestamp(),
          printf(({
            level, message, msglabel, msgTimestamp,
          }) =>
            `${msgTimestamp} [${msglabel}] ${level}: ${message}`),
        ),
        level: config.get('app.logLevel'),
        handleExceptions: true,
        transports: [
          new transports.Console(),
        ],
        exitOnError: false,
      });
    }
    this.logger = LOGGER;
  }

  log(...args) {
    this.print('silly', ...args);
  }

  info(...args) {
    this.print('info', ...args);
  }

  debug(...args) {
    this.print('debug', ...args);
  }

  warn(...args) {
    this.print('warn', ...args);
  }

  error(...args) {
    this.print('error', ...args);
  }

  print(type, ...data) {
    const messages = data.map((msg) => {
      switch (true) {
        case msg instanceof Error:
          return `${msg.message}. Stack:${msg.stack}`;
        case Buffer.isBuffer(msg):
          return msg.toString();
        case Utils.isObject(msg):
          return JSON.stringify(msg);
        default:
          return msg ? msg.toString() : msg;
      }
    });
    this.logger.log(type, messages.join(' | '));
  }
}

export const logger = new Logger();
