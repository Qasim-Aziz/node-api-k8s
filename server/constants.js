import * as httpStatus from 'http-status';

export const MINUTE = 1000 * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export const SESSION_ERRORS = Object.freeze({
  TEA_POT: {
    STATUS: 418,
    MSG: 'No session found',
    CODE: 'NO_SESSION_FOUND',
  },
  INVALID_TOKEN: {
    STATUS: httpStatus.FORBIDDEN,
    MSG: 'Invalid token',
    CODE: 'INVALID_TOKEN',
  },
  EXPIRED_SESSION: {
    STATUS: httpStatus.FORBIDDEN,
    MSG: 'Session expired',
    CODE: 'SESSION_EXPIRED',
  },
  BAD_REQUEST: {
    STATUS: httpStatus.BAD_REQUEST,
    MSG: 'Missing headers for authentication',
    CODE: 'MISSING_AUTHENTICATION_HEADERS',
  }
});

export const ENVS = Object.freeze({
  LOCAL: 'local',
  PROD: 'prod',
  TEST: 'test',
});

export const CLS_NAMESPACE = 'pavlova';

