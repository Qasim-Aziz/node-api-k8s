import { validation, Joi, Auth } from 'src/server/helpers';
import { ContextType, EmotionCode, PrivacyLevel } from 'src/server/constants';
import { MessageService } from 'src/server/topics/message/message.service';

export class MessageController {
  @validation({
    params: { messageId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async get(req) {
    const message = await MessageService.get(req.params.messageId, { reqUserId: req.user.id, updateViewCount: true });
    return { message };
  }

  @validation({
    query: {
      userId: Joi.number().integer().required(),
      limit: Joi.number().integer().optional(),
      offset: Joi.number().integer().optional(),
    },
  })
  @Auth.forLogged()
  static async getAll(req) {
    const { query: { userId, limit, offset }, user: { id: reqUserId } } = req;
    const { messages, total } = await MessageService.getAll(reqUserId, userId, { limit, offset });
    return { messages, total };
  }

  @validation({
    body: {
      query: {
        context: Joi.any().valid(...Object.values(ContextType)).optional(),
      },
    },
  })
  @Auth.forLogged()
  static async getNext(req) {
    const message = await MessageService.getNext(req.user.id, { context: req.query.context });
    return { message };
  }

  @validation({
    limit: Joi.number().integer().optional().default(10),
    offset: Joi.number().integer().optional().default(0),
  })
  @Auth.forLogged()
  static async getFavorites(req) {
    const { user: { id: reqUserId }, query: { limit, offset } } = req;
    const { messages, total } = await MessageService.getAll(reqUserId, reqUserId, { favorite: true, limit, offset });
    return { messages, total };
  }

  @validation({
    query: { q: Joi.string().optional() },
  })
  @Auth.forLogged()
  static async searchTraits(req) {
    const traits = await MessageService.searchTraits(req.query.q);
    return { traits };
  }

  @validation({
    body: {
      emotionCode: Joi.any().valid(...Object.values(EmotionCode)).required(),
      privacy: Joi.any().valid(...Object.values(PrivacyLevel)).required(),
      content: Joi.string().required(),
      traitNames: Joi.array().items(Joi.string().regex(/^[A-Za-z0-9]+$/)).optional(),
    },
  })
  @Auth.forLogged()
  static async create(req, { transaction = null } = {}) {
    const { body: messageData, user: { id: reqUserId } } = req;
    const message = await MessageService.create({ ...messageData, userId: reqUserId }, { transaction });
    return { message };
  }

  @validation({
    body: {
      emotionCode: Joi.any().valid(...Object.values(EmotionCode)).optional(),
      privacy: Joi.any().valid(...Object.values(PrivacyLevel)).optional(),
      content: Joi.string().optional(),
      traitNames: Joi.array().items(Joi.string().regex(/^[A-Za-z0-9]+$/)).optional(),
    },
    params: { messageId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async update(req, { transaction = null } = {}) {
    const { params: { messageId }, body: messageData, user: { id: reqUserId } } = req;
    await MessageService.checkUserRight(reqUserId, messageId);
    const message = await MessageService.update(messageId, messageData, { transaction, userId: reqUserId });
    return { message };
  }

  @validation({
    params: { messageId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async loveOrUnlove(req, { transaction = null } = {}) {
    const { params: { messageId }, user: { id: reqUserId } } = req;
    const message = await MessageService.loveOrUnlove(messageId, reqUserId, { transaction });
    return { message };
  }

  @validation({
    params: { messageId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async addOrRemoveFavorite(req, { transaction = null } = {}) {
    const { params: { messageId }, user: { id: reqUserId } } = req;
    const message = await MessageService.addOrRemoveFavorite(messageId, reqUserId, { transaction });
    return { message };
  }

  @validation({
    params: { messageId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async delete(req, { transaction = null } = {}) {
    const { params: { messageId }, user: { id: reqUserId } } = req;
    await MessageService.delete(messageId, reqUserId, { transaction });
    return { status: 'OK' };
  }
}
