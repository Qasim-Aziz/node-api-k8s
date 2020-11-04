import * as jwt from 'jsonwebtoken';
import { BackError, moment } from 'src/server/helpers';
import config from 'src/config';
import { SESSION_ERRORS } from 'src/server/constants';
import { Session } from 'src/orm';

const makeError = (errorObject): BackError => new BackError(errorObject.MSG, errorObject.STATUS, { code: errorObject.CODE });

export class SessionManager {
  static getToken = (req): string => req.header('Authorization') || req.cookies.token;

  static decipherSession = (token) => {
    try {
      return jwt.verify(token.slice(7), config.get('app.jwtSecret'));
    } catch (err) {
      throw makeError(SESSION_ERRORS.INVALID_TOKEN);
    }
  };

  static async getUserSession(req) {
    const session = await SessionManager.getSession(req);
    await req.user.getUserSession(session.userId);
    Object.assign(req, { session });
  }

  static async getSession(req) {
    const token = SessionManager.getToken(req);
    console.log(token);
    return SessionManager.getSessionByToken(token);
  }

  static async getSessionByToken(token, { transaction = null } = {}) {
    const session = await SessionManager.findSessionByToken(token, { transaction });
    if (!session) {
      throw makeError(SESSION_ERRORS.TEA_POT);
    }
    if (moment().isAfter(moment(session.expire))) {
      throw makeError(SESSION_ERRORS.EXPIRED_SESSION);
    }
    return session;
  }

  static async findSessionByToken(token, { transaction = null } = {}) {
    if (!token) {
      throw makeError(SESSION_ERRORS.BAD_REQUEST);
    }
    const auth = SessionManager.decipherSession(token);
    if (!auth.sid) {
      return null;
    }
    return Session.findOne({ where: { sid: auth.sid, userId: auth.id, logoutAt: null }, transaction });
  }

  static makeSession(session: Session) {
    return `Bearer ${jwt.sign({ id: session.userId, sid: session.sid }, config.get('app.jwtSecret'))}`;
  }
}
