import httpStatus from 'http-status';

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
  },
});

export const ENVS = Object.freeze({
  LOCAL: 'local',
  PROD: 'prod',
  TEST: 'test',
});

export const CLS_NAMESPACE = 'jardinsecret';

export const secret = process.env.JWT_SECRET || 'FDA1A481A5928A35D7CD281076DE2791857D92F7E7742F7E32E6248DF5BDFBFA';

export const EMOTION_CODE = Object.freeze({
  APAISE: 'APAISE',
  CONTENT: 'CONTENT',
  DECU: 'DECU',
  CHOQUE: 'CHOQUE',
  DEPITE: 'DEPITE',
  DEPRIME: 'DEPRIME',
  EFFONDRE: 'EFFONDRE',
  ENERVE: 'ENERVE',
  HEUREUX: 'HEUREUX',
  INCOMPRIS: 'INCOMPRIS',
  LASSE: 'LASSE',
  LEGER: 'LEGER',
  NERVEUX: 'NERVEUX',
  SURPRIS: 'SURPRIS',
  TRISTE: 'TRISTE',
});

export const PRIVACY_LEVEL = Object.freeze({
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
});
