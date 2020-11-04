import * as uuid from 'uuid';
import httpStatus from 'http-status';
import config from 'src/config';
import { BackError, moment } from 'src/server/helpers';
import { Session } from 'src/orm';
import { Op } from 'src/orm/database';

export default class SessionService {
  static async assertNotTooManySessionsOpened(userId, { transaction }) {
    const sessionCount = await Session.unscoped().count({
      where: { userId, logoutAt: null, expires: { [Op.gte]: moment() } },
      transaction,
    });
    if (sessionCount >= config.get('session.maxSimultaneous')) {
      throw new BackError('TOO_MANY_OPEN_SESSIONS', httpStatus.UNAUTHORIZED);
    }
  }

  static async createSession(userId, { transaction = null } = {}) {
    await SessionService.assertNotTooManySessionsOpened(userId, { transaction });
    const now = moment();
    const session = await Session.create({
      sid: uuid.v4(),
      loginAt: now,
      lastRefreshTime: now,
      userId,
      logoutAt: null,
      expires: moment(now).add(config.get('session.ttl')),
    }, { transaction });
    return session;
  }
}
