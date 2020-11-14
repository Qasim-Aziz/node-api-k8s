import { validation, Joi, Auth } from 'src/server/helpers';
import { AuthService } from 'src/server/topics/auth/auth.service';

export class AuthController {
  @validation({
    body: {
      email: Joi.string().lowercase().email().required(),
      password: Joi.string().required(),
    },
  })
  @Auth.forAll()
  static async login(req, { transaction = null, cookiesManager = null } = {}) {
    const { body: { email, password } } = req;
    const { user, token } = await AuthService.login(email, password, { transaction });
    cookiesManager.setCookies(token);
    return { user, token };
  }

  @validation({
    body: {
      email: Joi.string().lowercase().email().required(),
      pseudo: Joi.string().lowercase().required(),
      password: Joi.string().required(),
    },
  })
  @Auth.forAll()
  static async register(req, { transaction = null, cookiesManager = null } = {}) {
    const { body: { email, pseudo, password } } = req;
    const { user, token } = await AuthService.register({ email, pseudo, password }, { transaction });
    cookiesManager.setCookies(token);
    return { user, token };
  }

  @validation({})
  @Auth.forAll()
  static async logout(req, { transaction = null, cookiesManager = null } = {}) {
    const { token } = req;
    await AuthService.logout(token, { transaction });
    cookiesManager.clearCookies();
    return { status: 'Ok' };
  }
}