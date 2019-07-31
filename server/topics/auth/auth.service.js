import jwt from 'jsonwebtoken';
import moment from 'server/helpers/moment';
import config from 'config/env';

import logger from 'server/helpers/logger';

export class AuthService {
  static generateToken(user) {
    const expires = moment().add({ days: 1 }).toISOString();
    const payload = { userId: user.id, expires };
    return jwt.sign(payload, config.jwtSecret);
  };
}
