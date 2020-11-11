import { validation, Joi, Auth } from 'src/server/helpers';
import { EmotionCode, PrivacyLevel } from 'src/server/constants';
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
    query: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async getAll(req) {
    const messages = await MessageService.getAll(req.user.id, req.query.userId);
    return { messages };
  }

  @validation({})
  @Auth.forLogged()
  static async getNext(req) {
    const message = await MessageService.getNext(req.user.id);
    return { message };
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
      userId: Joi.number().required(),
    },
  })
  @Auth.forLogged()
  static async create(req, { transaction = null } = {}) {
    const { body: messageData } = req;
    const message = await MessageService.create(messageData, { transaction });
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
    const { params: { messageId }, body: messageData } = req;
    await MessageService.checkUserRight(req.user.id, messageId);
    const message = await MessageService.update(messageId, messageData, { transaction });
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
