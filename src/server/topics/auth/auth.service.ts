import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { User } from 'src/orm';
import { BackError, logger, moment } from 'src/server/helpers';
import SessionService from 'src/server/topics/auth/session.service';
import { SessionManager } from 'src/server/acl/session-manager';
import UserService from 'src/server/topics/user/user.service';
import crypto from 'crypto';
import EmailService from 'src/server/topics/email/email.service';
import { EmailTemplates } from 'src/server/topics/email/templates/templates.enum';
import { Op } from 'src/orm/database';

export class AuthService {
  static async registerPatient({
    email, pseudo, password, gender,
  }, { transaction = null } = {}) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      email, pseudo, passwordHash, gender,
    }, { transaction });
    return AuthService.login(email, password, { transaction });
  }

  static async login(email, password, { transaction = null } = {}) {
    const user = await User.findOne({ where: { email }, transaction });
    if (!user) throw new BackError('User not found', httpStatus.NOT_FOUND);
    const isPwdOk = await bcrypt.compare(password, user.passwordHash);
    if (!isPwdOk) throw new BackError('Wrong password', httpStatus.BAD_REQUEST);
    return AuthService.createSession(user, { transaction });
  }

  static async createSession(user, { transaction = null } = {}) {
    const session = await SessionService.createSession(user.id, { transaction });
    const token = SessionManager.makeSession(session);
    await UserService.refreshUserLastConnexionDate(user.id, { transaction });
    return { token, user: await UserService.getUser(user.id, { transaction }) };
  }

  static async logout(token, { transaction = null } = {}) {
    const session = await SessionManager.getSessionByToken(token, { transaction });
    await session.update({ logoutAt: moment() }, { transaction });
  }

  static async forgetPassword(email, { transaction = null } = {}) {
    const user = await User.unscoped().findOne({ where: { email }, transaction });
    if (!user) {
      logger.info(`user with email ${email} not found`);
      return;
    }
    const resetPasswordCode = crypto.randomBytes(6).toString('hex').substr(2, 6).toUpperCase();
    const resetPasswordExpires = moment().add(1, 'hour');
    await user.update({ resetPasswordCode, resetPasswordExpires }, { transaction });

    await EmailService.sendEmail({
      to: user.email,
      template: EmailTemplates.RESET_PASSWORD,
      templateData: {
        pseudo: user.pseudo,
        resetPasswordCode,
      },
    });
  }

  static async resetPassword(email, resetPasswordCode, { transaction = null } = {}) {
    const user = await User.unscoped().findOne({
      where: {
        email,
        resetPasswordCode,
        resetPasswordExpires: { [Op.lte]: moment.utc() },
      },
      transaction,
      logging: console.log,
    });
    if (!user) {
      throw new BackError('Invalid resetPasswordCode', httpStatus.BAD_REQUEST);
    }

    await user.update({ shouldResetPassword: true }, { transaction });
    return AuthService.createSession(user, { transaction });
  }
}
