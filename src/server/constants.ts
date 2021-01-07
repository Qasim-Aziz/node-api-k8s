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

export enum EmotionCode {
  APAISE = 'APAISE',
  CONTENT = 'CONTENT',
  DECU = 'DECU',
  CHOQUE = 'CHOQUE',
  DEPITE = 'DEPITE',
  DEPRIME = 'DEPRIME',
  EFFONDRE = 'EFFONDRE',
  ENERVE = 'ENERVE',
  HEUREUX = 'HEUREUX',
  INCOMPRIS = 'INCOMPRIS',
  LASSE = 'LASSE',
  LEGER = 'LEGER',
  NERVEUX = 'NERVEUX',
  SURPRIS = 'SURPRIS',
  TRISTE = 'TRISTE',
}

export enum PrivacyLevel {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum DynamicLevel {
  COUCI_COUCA = 'COUCI_COUCA',
  DES_JOURS_MEILLEURS = 'DES_JOURS_MEILLEURS',
  EN_FORME = 'EN FORME',
  NOUVEAU = 'NOUVEAU',
}

export const EmotionNote = {
  [EmotionCode.APAISE]: 8,
  [EmotionCode.CONTENT]: 9,
  [EmotionCode.DECU]: 3,
  [EmotionCode.CHOQUE]: 4,
  [EmotionCode.DEPITE]: 3,
  [EmotionCode.DEPRIME]: 2,
  [EmotionCode.EFFONDRE]: 1,
  [EmotionCode.ENERVE]: 4,
  [EmotionCode.HEUREUX]: 10,
  [EmotionCode.INCOMPRIS]: 4,
  [EmotionCode.LASSE]: 5,
  [EmotionCode.LEGER]: 7,
  [EmotionCode.NERVEUX]: 4,
  [EmotionCode.SURPRIS]: 5,
  [EmotionCode.TRISTE]: 3,
};

export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum UserType {
  PATIENT = 'PATIENT',
  THERAPIST = 'THERAPIST',
}

export enum TropheeCode {
  BADGE_1 = 'BADGE_1',
  BADGE_2 = 'BADGE_2',
  BADGE_3 = 'BADGE_3',
  BADGE_4 = 'BADGE_4',
  BADGE_5 = 'BADGE_5',
  BADGE_6 = 'BADGE_6',
  BADGE_7 = 'BADGE_7',
  BADGE_8 = 'BADGE_8',
  BADGE_9 = 'BADGE_9',
}

export const TropheeScore = {
  [TropheeCode.BADGE_1]: 4,
  [TropheeCode.BADGE_2]: 9,
  [TropheeCode.BADGE_3]: 15,
  [TropheeCode.BADGE_4]: 25,
  [TropheeCode.BADGE_5]: 40,
  [TropheeCode.BADGE_6]: 50,
  [TropheeCode.BADGE_7]: 80,
  [TropheeCode.BADGE_8]: 150,
  [TropheeCode.BADGE_9]: 300,
};
