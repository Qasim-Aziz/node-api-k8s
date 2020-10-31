import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import config from 'src/config';
import { User } from '../../../orm';
import { BackError, moment } from '../../helpers';

export class AuthService {
  static generateToken(user) {
    const expires = moment().add({ days: 1 }).toISOString();
    const payload = { userId: user.id, expires };
    return jwt.sign(payload, config.get('app.jwtSecret'));
  }

  static async login(email, password, { transaction = null } = {}) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new BackError('User not found');
    const isPwdOk = await bcrypt.compare(password, user.passwordHash);
    if (!isPwdOk) throw new BackError('Wrong password', httpStatus.BAD_REQUEST);
    const token = AuthService.generateToken(user);
    return { user, token };
  }
}
