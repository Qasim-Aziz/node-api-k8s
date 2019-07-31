import passport from 'passport';
import phoneValidator from 'joi-phone-validator';
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { validation } from 'server/helpers/helpers';
import Joi from 'server/helpers/joi';
import { User } from 'orm';
import BackError from 'server/helpers/back.error';
import { AuthService } from 'server/topics/auth/auth.service';
import logger from 'server/helpers/logger';

export class AuthController {
  @validation({
    body: {
      email: Joi.string().lowercase().email().required(),
      password: Joi.string().required(),
    },
  })
  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) throw new BackError(`User not found`);
    const isPwdOk = await bcrypt.compare(password, user.passwordHash);
    if (!isPwdOk) throw new BackError('Wrong password', httpStatus.BAD_REQUEST);
    const token = AuthService.generateToken(user);
    res.cookie('jwt', token);
    res.json({ user });
  }

  @validation({
    body: {
      email: Joi.string().lowercase().email().required(),
      phone: phoneValidator.phone().mobile().required(),
      password: Joi.string().required(),
    },
  })
  async register(req, res) {
    const { email, phone, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, phone, passwordHash });
    return this.login(req, res);
  }

  @validation({})
  async logout(req, res) {
    //todo list of blacklisted token that are not yet expired
    res.clearCookie('jwt');
    res.clearCookie('expires');
    res.json({});
  }
}
