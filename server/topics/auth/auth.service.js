import jwt from 'jsonwebtoken';
import moment from 'server/helpers/moment';
import { secret } from 'server/constants';

export class AuthService {
  static async generateToken(user) {
    const expires = moment().add({ days: 1 }).unix();
    const payload = { userId: user.id, expires };
    return jwt.sign(payload, secret);
  };
}
