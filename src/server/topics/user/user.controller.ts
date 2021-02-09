import httpStatus from 'http-status';
import {
  validation, Joi, Auth, BackError,
} from 'src/server/helpers';
import UserService from 'src/server/topics/user/user.service';

export class UserController {
  @validation({
    params: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async getUser(req, { transaction = null } = {}) {
    const { params: { userId }, user: { id: reqUserId } } = req;
    const user = await UserService.getUser(userId, { reqUserId, transaction });
    return { user };
  }

  @validation({})
  @Auth.forLogged()
  static async getMe(req, { transaction = null } = {}) {
    const { user: { id: userId } } = req;
    const user = await UserService.getUser(userId, { reqUserId: userId, transaction });
    return { user };
  }

  @validation({
    body: {
      password: Joi.string().min(8).max(50),
      pseudo: Joi.string().lowercase().optional(),
      description: Joi.string().optional(),
      traitNames: Joi.array().items(Joi.string().regex(/^[A-Za-z0-9]+$/)).optional(),
    },
  })
  @Auth.forLogged()
  static async updateMe(req, { transaction = null } = {}) {
    const { user: { id: userId }, body: userData } = req;
    const user = await UserService.updateUser(userId, userData, { transaction });
    return { user };
  }

  @validation({
    params: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async refreshUserLastConnexionDate(req, { transaction = null } = {}) {
    const { params: { userId }, user: { id: reqUserId } } = req;
    if (reqUserId !== userId) throw new BackError('Should be the same user id', httpStatus.BAD_REQUEST);
    const user = await UserService.refreshUserLastConnexionDate(userId, { transaction });
    return { user };
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

  @validation({
    params: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async followOrUnfollow(req, { transaction = null } = {}) {
    const { params: { userId: followedId }, user: { id: followerId } } = req;
    const user = await UserService.followOrUnfollow(followerId, followedId, { transaction });
    return { user };
  }

  @validation({
    params: {
      userId: Joi.number().integer().required(),
    },
    query: {
      limit: Joi.number().integer().optional().default(10),
      offset: Joi.number().integer().optional().default(0),
    },
  })
  @Auth.forLogged()
  static async getFollowers(req, { transaction = null } = {}) {
    const { params: { userId: followedId }, query: { limit, offset } } = req;
    const { followers, total } = await UserService.getFollowers(followedId, { transaction, limit, offset });
    return { followers, total };
  }

  @validation({
    params: {
      userId: Joi.number().integer().required(),
    },
    query: {
      limit: Joi.number().integer().optional().default(10),
      offset: Joi.number().integer().optional().default(0),
    },
  })
  @Auth.forLogged()
  static async getFollowed(req, { transaction = null } = {}) {
    const { params: { userId: followerId }, query: { limit, offset } } = req;
    const { followed, total } = await UserService.getFollowed(followerId, { transaction, limit, offset });
    return { followed, total };
  }
}
