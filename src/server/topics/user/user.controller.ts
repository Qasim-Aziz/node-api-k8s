import httpStatus from 'http-status';
import { validation, Joi, Auth, BackError } from 'src/server/helpers';
import UserService from 'src/server/topics/user/user.service';

export class UserController {
  @validation({
    params: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async getUser(req, res) {
    const { transaction, params: { userId } } = req;
    const user = await UserService.getUser(userId, { transaction });
    res.json({ user });
  }

  @validation({
    params: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async refreshUserLastConnexionDate(req, res) {
    const { transaction, params: { userId }, user: { id: reqUserId } } = req;
    if (reqUserId !== userId) throw new BackError('Should be the same user id', httpStatus.BAD_REQUEST);
    const user = await UserService.refreshUserLastConnexionDate(userId, { transaction });
    res.json({ user });
  }

  @validation({
    params: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async getAllFavorite(req, res) {
    const { transaction, params: { userId }, user: { id: reqUserId } } = req;
    if (reqUserId !== userId) throw new BackError('Should be the same user id', httpStatus.BAD_REQUEST);
    const messages = await UserService.getAllFavorites(userId, { transaction });
    res.json({ messages });
  }

  @validation({
    query: { email: Joi.string().lowercase().email().required() },
  })
  @Auth.forAll()
  static async getByEmail(req) {
    const { query: { email }, transaction } = req;
    const emailUsed = await UserService.checkEmailExist(email, { transaction });
    return { emailUsed };
  }

  @validation({
    query: { pseudo: Joi.string().lowercase().required() },
  })
  @Auth.forAll()
  static async getByPseudo(req) {
    const { query: { pseudo }, transaction } = req;
    const pseudoUsed = await UserService.checkPseudoExist(pseudo, { transaction });
    return { pseudoUsed };
  }
}
