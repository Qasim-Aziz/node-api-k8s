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
    const { params: { userId } } = req;
    const user = await UserService.getUser(userId, { transaction });
    return { user };
  }

  @validation({
    params: { userId: Joi.number().integer().required() },
    body: {
      pseudo: Joi.string().lowercase().optional(),
      description: Joi.string().optional(),
    },
  })
  @Auth.forLogged()
  static async updateUser(req, { transaction = null } = {}) {
    const { params: { userId }, body: userData, user: { id: reqUserId } } = req;
    if (userId !== reqUserId) throw new BackError('Cannot update another user', httpStatus.FORBIDDEN);
    const user = await UserService.updateUser(userId, userData, { transaction });
    return { user };
  }

  @validation({})
  @Auth.forLogged()
  static async getMe(req, { transaction = null } = {}) {
    const { user: { id: userId } } = req;
    const user = await UserService.getUser(userId, { transaction });
    return { user };
  }

  @validation({
    body: {
      password: Joi.string().min(8).max(50)
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
    params: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async getFollowers(req, { transaction = null } = {}) {
    const { params: { userId: followedId } } = req;

    const followers = await UserService.getFollowers(followedId, { transaction });
    return { followers };
  }

  @validation({
    params: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async getFollowed(req, { transaction = null } = {}) {
    const { params: { userId: followerId } } = req;

    const followed = await UserService.getFollowed(followerId, { transaction });
    return { followed };
  }
}
