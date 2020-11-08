import { validation, Joi, Auth } from 'src/server/helpers';
import { AuthService } from 'src/server/topics/auth/auth.service';
import { CookiesManager } from 'src/server/acl/cookies-manager';
import { SessionManager } from 'src/server/acl/session-manager';

export class AuthController {
  @validation({
    body: {
      email: Joi.string().lowercase().email().required(),
      password: Joi.string().required(),
    },
  })
  @Auth.forAll()
  static async login(req, res) {
    const { body: { email, password }, transaction } = req;
    const { user, token } = await AuthService.login(email, password, { transaction });
    CookiesManager.setCookies(res, token);
    res.json({ user });
  }

  @validation({
    body: {
      email: Joi.string().lowercase().email().required(),
      pseudo: Joi.string().lowercase().required(),
      password: Joi.string().required(),
    },
  })
  @Auth.forAll()
  static async register(req, res) {
    const { body: { email, pseudo, password }, transaction } = req;
    const { user, token } = await AuthService.register({ email, pseudo, password }, { transaction });
    CookiesManager.setCookies(res, token);
    res.json({ user });
  }

  @validation({})
  @Auth.forAll()
  static async logout(req, res) {
    const { transaction } = req;
    const token = SessionManager.getToken(req);
    await AuthService.logout(token, { transaction });
    CookiesManager.clearCookies(res);
    res.json({ status: 'Ok' });
  }
}
