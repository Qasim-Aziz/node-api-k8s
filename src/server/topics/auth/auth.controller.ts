import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { validation, Joi, BackError } from 'src/server/helpers';
import { User } from 'src/orm';
import { AuthService } from 'src/server/topics/auth/auth.service';

export class AuthController {
  @validation({
    body: {
      email: Joi.string().lowercase().email().required(),
      password: Joi.string().required(),
    },
  })
  async login(req, res) {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);
    res.cookie('jwt', token);
    res.json({ user });
  }

  @validation({
    body: {
      email: Joi.string().lowercase().email().required(),
      pseudo: Joi.string().required(),
      password: Joi.string().required(),
    },
  })
  async register(req, res) {
    const { email, pseudo, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, pseudo, passwordHash });
    const { user, token } = await AuthService.login(email, password);
    res.cookie('jwt', token);
    res.json({ user });
  }

  @validation({})
  async logout(req, res) {
    // todo list of blacklisted token that are not yet expired
    res.clearCookie('jwt');
    res.clearCookie('expires');
    res.json({});
  }
}
