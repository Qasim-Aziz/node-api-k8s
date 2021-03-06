import { validation, Joi, Auth } from 'src/server/helpers';
import { AuthService } from 'src/server/topics/auth/auth.service';
import { GenderType } from 'src/server/constants';

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
      gender: Joi.any().valid(...Object.values(GenderType)).required(),
    },
  })
  @Auth.forAll()
  static async registerPatient(req, { transaction = null, cookiesManager = null } = {}) {
    const {
      body: {
        email, pseudo, password, gender,
      },
    } = req;
    const { user, token } = await AuthService.registerPatient({
      email, pseudo, password, gender,
    }, { transaction });
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

  @validation({
    body: { email: Joi.string().email().required() },
  })
  @Auth.forAll()
  static async forgetPassword(req, { transaction = null } = {}) {
    const { body: { email } } = req;
    await AuthService.forgetPassword(email, { transaction });
    return { status: 'OK' };
  }

  @validation({
    body: {
      email: Joi.string().email().required(),
      resetPasswordCode: Joi.string().min(6).max(8).required(),
    },
  })
  @Auth.forAll()
  static async resetPassword(req, { transaction, cookiesManager }) {
    const { body: { email, resetPasswordCode } } = req;
    const { user, token } = await AuthService.resetPassword(email, resetPasswordCode.toUpperCase(), { transaction });
    cookiesManager.setCookies(token);
    return { user, token };
  }
}
