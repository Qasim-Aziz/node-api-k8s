import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { User } from 'src/orm';
import { BackError, moment } from 'src/server/helpers';
import SessionService from 'src/server/topics/auth/session.service';
import { SessionManager } from 'src/server/acl/session-manager';

export class AuthService {
  static async register({ email, pseudo, password }, { transaction }) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, pseudo, passwordHash }, { transaction });
    return AuthService.login(email, password, { transaction });
  }

  static async login(email, password, { transaction = null } = {}) {
    const user = await User.findOne({ where: { email }, transaction });
    if (!user) throw new BackError('User not found');
    const isPwdOk = await bcrypt.compare(password, user.passwordHash);
    if (!isPwdOk) throw new BackError('Wrong password', httpStatus.BAD_REQUEST);
    const session = await SessionService.createSession(user.id, { transaction });
    const token = SessionManager.makeSession(session);
    return { user, token };
  }

  static async logout(token, { transaction = null } = {}) {
    const session = await SessionManager.getSessionByToken(token, { transaction });
    await session.update({ logoutAt: moment() }, { transaction });
  }
}
